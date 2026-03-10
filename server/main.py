from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import sqlite3
import os
from dotenv import load_dotenv
load_dotenv('.env.local')
import json
from datetime import datetime

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

app = FastAPI(title="VoiceFlow AI API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
DB_PATH = "voiceflow.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.executescript('''
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            lead_score INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES conversations(id)
        );
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT,
            email TEXT,
            status TEXT DEFAULT 'new',
            score INTEGER DEFAULT 0,
            conversation_id INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS campaigns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT DEFAULT 'voice',
            status TEXT DEFAULT 'draft',
            target TEXT,
            message TEXT,
            progress INTEGER DEFAULT 0,
            total INTEGER DEFAULT 0,
            leads_generated INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS escalations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER,
            reason TEXT,
            priority TEXT DEFAULT 'medium',
            status TEXT DEFAULT 'pending',
            last_message TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS call_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone_number TEXT,
            duration INTEGER DEFAULT 0,
            outcome TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    ''')
    # Seed sample data if empty
    if not c.execute("SELECT * FROM conversations").fetchall():
        c.executescript('''
            INSERT INTO conversations (name, status, lead_score) VALUES 
                ('Alex Thompson', 'active', 85),
                ('Sarah Miller', 'active', 92),
                ('Michael Chen', 'active', 45),
                ('Emma Wilson', 'active', 78),
                ('James Brown', 'active', 30);
            INSERT INTO messages (conversation_id, role, content) VALUES
                (1, 'user', 'Hi, I am interested in the enterprise plan'),
                (1, 'assistant', 'Hello! I would be happy to help you with our enterprise plan.'),
                (2, 'user', 'How do I book a demo for next week?'),
                (2, 'assistant', 'I can help you schedule a demo! What time works best for you?'),
                (3, 'user', 'What are the main features of VoiceFlow?'),
                (3, 'assistant', 'VoiceFlow AI offers inbound/outbound calling, lead qualification, and more!');
            INSERT INTO leads (name, phone, status, score, conversation_id) VALUES
                ('Alex Thompson', '+1234567890', 'qualified', 85, 1),
                ('Sarah Miller', '+0987654321', 'negotiation', 92, 2),
                ('Michael Chen', '+1122334455', 'contacted', 45, 3),
                ('Emma Wilson', '+5544332211', 'qualified', 78, 4);
            INSERT INTO campaigns (name, type, status, target, message, progress, total, leads_generated) VALUES
                ('Cold Outreach v1', 'voice', 'running', 'SMB owners', 'Hi, this is VoiceFlow AI calling...', 750, 1000, 42),
                ('Re-engagement Q1', 'text', 'paused', 'Past customers', 'We have new features for you!', 120, 500, 15),
                ('Webinar Follow-up', 'voice', 'draft', 'Webinar attendees', 'Thanks for attending our webinar!', 0, 300, 0);
            INSERT INTO escalations (conversation_id, reason, priority, status, last_message) VALUES
                (1, 'Negative sentiment detected', 'high', 'pending', 'I am really frustrated with the service!'),
                (2, 'Complex query threshold', 'medium', 'pending', 'Can you explain GDPR compliance steps?');
        ''')
    conn.commit()
    conn.close()

init_db()

# Models
class MessageRequest(BaseModel):
    message: str
    history: Optional[List[Dict]] = []

class NewConversation(BaseModel):
    name: str

class LeadCreate(BaseModel):
    name: str
    phone: Optional[str] = ""
    email: Optional[str] = ""
    status: Optional[str] = "new"
    score: Optional[int] = 0

class LeadUpdate(BaseModel):
    status: Optional[str] = None
    score: Optional[int] = None

class CampaignCreate(BaseModel):
    name: str
    type: Optional[str] = "voice"
    target: Optional[str] = ""
    message: Optional[str] = ""
    total: Optional[int] = 100

class CampaignUpdate(BaseModel):
    status: Optional[str] = None
    progress: Optional[int] = None

class EscalationUpdate(BaseModel):
    status: Optional[str] = None
    ai_enabled: Optional[bool] = None

class CallRequest(BaseModel):
    phone_number: str

# Stats
@app.get("/api/stats")
async def get_stats():
    conn = get_db()
    c = conn.cursor()
    total_convs = c.execute("SELECT COUNT(*) FROM conversations").fetchone()[0]
    total_leads = c.execute("SELECT COUNT(*) FROM leads").fetchone()[0]
    active_campaigns = c.execute("SELECT COUNT(*) FROM campaigns WHERE status='running'").fetchone()[0]
    escalations = c.execute("SELECT COUNT(*) FROM escalations WHERE status='pending'").fetchone()[0]
    conn.close()
    return {
        "total_conversations": total_convs,
        "qualified_leads": total_leads,
        "active_campaigns": active_campaigns,
        "human_escalations": escalations,
        "campaign_roi": 24.8,
        "avg_response_time": 0.8
    }

# Conversations
@app.get("/api/conversations")
async def get_conversations():
    conn = get_db()
    rows = conn.execute("SELECT * FROM conversations ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/api/conversations")
async def create_conversation(data: NewConversation):
    conn = get_db()
    c = conn.cursor()
    c.execute("INSERT INTO conversations (name) VALUES (?)", (data.name,))
    conn.commit()
    id = c.lastrowid
    conn.close()
    return {"id": id, "name": data.name, "status": "active", "lead_score": 0}

@app.get("/api/conversations/{conv_id}/messages")
async def get_messages(conv_id: int):
    conn = get_db()
    rows = conn.execute("SELECT * FROM messages WHERE conversation_id=? ORDER BY created_at ASC", (conv_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/api/conversations/{conv_id}/messages")
async def send_message(conv_id: int, data: MessageRequest):
    conn = get_db()
    c = conn.cursor()

    # Save user message
    c.execute("INSERT INTO messages (conversation_id, role, content) VALUES (?, 'user', ?)",
              (conv_id, data.message))

# Call Groq AI
    try:
        from groq import Groq
        client = Groq(api_key=GROQ_API_KEY)
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
               {"role": "system", "content": """You are an AI assistant for Creaturn Media, a creative agency offering Social Media Management, Video Production, Branding & Design, Content Creation, and Paid Ads & Performance Marketing.
Your job is to:
1. LEAD QUALIFICATION - Ask about their business, budget, and goals to qualify potential clients
2. CLIENT ONBOARDING - Guide new clients through the onboarding process and collect necessary info
3. PROJECT STATUS - Help existing clients check on their project progress
4. APPOINTMENT BOOKING - Schedule discovery calls and meetings with the Creaturn Media team
5. SUPPORT & FAQs - Answer questions about services, pricing, timelines, and processes

Pricing Guidelines:
- Social Media Management: Starting from Rs.15,000/month
- Video Production: Starting from Rs.25,000/project
- Branding & Design: Starting from Rs.20,000/project
- Content Creation: Starting from Rs.10,000/month
- Paid Ads Management: Starting from Rs.12,000/month + ad spend

Always be professional, friendly and represent Creaturn Media with enthusiasm. If a lead seems interested, try to book a discovery call. If the query is too complex, escalate to the human team."""},
                {"role": "user", "content": data.message}
            ]
        )
        ai_reply = response.choices[0].message.content

        # Score lead based on keywords
        score_keywords = ['enterprise', 'pricing', 'demo', 'buy', 'purchase', 'plan', 'interested', 'book']
        score = sum(10 for kw in score_keywords if kw in data.message.lower())
        score = min(score, 40)

        # Update conversation score
        current = conn.execute("SELECT lead_score FROM conversations WHERE id=?", (conv_id,)).fetchone()
        if current:
            new_score = min((current[0] or 0) + score, 100)
            c.execute("UPDATE conversations SET lead_score=? WHERE id=?", (new_score, conv_id))

            # Auto-add to leads if score > 70
            if new_score > 70:
                conv = conn.execute("SELECT name FROM conversations WHERE id=?", (conv_id,)).fetchone()
                existing = conn.execute("SELECT id FROM leads WHERE conversation_id=?", (conv_id,)).fetchone()
                if not existing and conv:
                    c.execute("INSERT INTO leads (name, status, score, conversation_id) VALUES (?, 'qualified', ?, ?)",
                              (conv['name'], new_score, conv_id))

    except Exception as e:
        ai_reply = f"I apologize, I'm having trouble connecting to my AI service. Error: {str(e)}"

    # Save AI reply
    c.execute("INSERT INTO messages (conversation_id, role, content) VALUES (?, 'assistant', ?)",
              (conv_id, ai_reply))
    conn.commit()
    conn.close()
    return {"reply": ai_reply}

# Leads
@app.get("/api/leads")
async def get_leads():
    conn = get_db()
    rows = conn.execute("SELECT * FROM leads ORDER BY score DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/api/leads")
async def create_lead(data: LeadCreate):
    conn = get_db()
    c = conn.cursor()
    c.execute("INSERT INTO leads (name, phone, email, status, score) VALUES (?, ?, ?, ?, ?)",
              (data.name, data.phone, data.email, data.status, data.score))
    conn.commit()
    id = c.lastrowid
    conn.close()
    return {"id": id, **data.dict()}

@app.patch("/api/leads/{lead_id}")
async def update_lead(lead_id: int, data: LeadUpdate):
    conn = get_db()
    if data.status:
        conn.execute("UPDATE leads SET status=? WHERE id=?", (data.status, lead_id))
    if data.score is not None:
        conn.execute("UPDATE leads SET score=? WHERE id=?", (data.score, lead_id))
    conn.commit()
    conn.close()
    return {"message": "Lead updated"}

# Campaigns
@app.get("/api/campaigns")
async def get_campaigns():
    conn = get_db()
    rows = conn.execute("SELECT * FROM campaigns ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/api/campaigns")
async def create_campaign(data: CampaignCreate):
    conn = get_db()
    c = conn.cursor()
    c.execute("INSERT INTO campaigns (name, type, target, message, total) VALUES (?, ?, ?, ?, ?)",
              (data.name, data.type, data.target, data.message, data.total))
    conn.commit()
    id = c.lastrowid
    conn.close()
    return {"id": id, **data.dict(), "status": "draft", "progress": 0}

@app.patch("/api/campaigns/{campaign_id}")
async def update_campaign(campaign_id: int, data: CampaignUpdate):
    conn = get_db()
    if data.status:
        conn.execute("UPDATE campaigns SET status=? WHERE id=?", (data.status, campaign_id))
    if data.progress is not None:
        conn.execute("UPDATE campaigns SET progress=? WHERE id=?", (data.progress, campaign_id))
    conn.commit()
    conn.close()
    return {"message": "Campaign updated"}

# Escalations
@app.get("/api/escalations")
async def get_escalations():
    conn = get_db()
    rows = conn.execute("SELECT * FROM escalations ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.patch("/api/escalations/{esc_id}")
async def update_escalation(esc_id: int, data: EscalationUpdate):
    conn = get_db()
    if data.status:
        conn.execute("UPDATE escalations SET status=? WHERE id=?", (data.status, esc_id))
    conn.commit()
    conn.close()
    return {"message": "Escalation updated"}

# Calls
@app.post("/api/calls/outbound")
async def make_call(data: CallRequest):
    try:
        from twilio.rest import Client
        account_sid = os.getenv("VITE_TWILIO_ACCOUNT_SID")
        auth_token = os.getenv("VITE_TWILIO_AUTH_TOKEN")
        from_number = os.getenv("VITE_TWILIO_PHONE_NUMBER")
        client = Client(account_sid, auth_token)
        call = client.calls.create(
            to=data.phone_number,
            from_=from_number,
            twiml='<Response><Say>Hello! This is VoiceFlow AI. How can I help you today?</Say></Response>'
        )
        conn = get_db()
        conn.execute("INSERT INTO call_logs (phone_number, outcome) VALUES (?, 'initiated')", (data.phone_number,))
        conn.commit()
        conn.close()
        return {"success": True, "call_sid": call.sid, "status": call.status}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/api/call-logs")
async def get_call_logs():
    conn = get_db()
    rows = conn.execute("SELECT * FROM call_logs ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
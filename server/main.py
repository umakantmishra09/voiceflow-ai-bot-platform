from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from .database.manager import db
from .utils.gemini import GeminiAI
import os

app = FastAPI(title="VoiceFlow AI API")

# Configure CORS for React Dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/conversations")
async def get_conversations():
    return db.get_all_conversations()

@app.get("/api/conversations/{conv_id}/messages")
async def get_messages(conv_id: int):
    return db.get_messages(conv_id)

@app.get("/api/stats")
async def get_stats():
    convs = db.get_all_conversations()
    total_convs = len(convs)
    total_leads = len([c for c in convs if c['lead_score'] > 50])
    
    return {
        "total_conversations": total_convs,
        "total_leads": total_leads,
        "active_campaigns": 0,
        "human_escalations": 0
    }

@app.get("/api/leads")
async def get_leads():
    # Mock lead retrieval from database
    return []

@app.post("/api/campaigns")
async def create_campaign(name: str):
    # Mock campaign creation
    return {"message": f"Campaign {name} created successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

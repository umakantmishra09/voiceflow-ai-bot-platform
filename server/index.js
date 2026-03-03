require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const twilio = require('twilio');
const db = require('./db');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// AI Configuration
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Twilio Configuration
const twilioClient = twilio(process.env.VITE_TWILIO_ACCOUNT_SID, process.env.VITE_TWILIO_AUTH_TOKEN);

// API Endpoints

// Conversations
app.get('/api/conversations', (req, res) => {
  const rows = db.prepare('SELECT * FROM conversations ORDER BY updated_at DESC').all();
  res.json(rows);
});

app.post('/api/conversations', (req, res) => {
  const { username } = req.body;
  const id = 'conv_' + uuidv4().slice(0, 8);
  db.prepare('INSERT INTO conversations (id, username, last_message, status) VALUES (?, ?, ?, ?)').run(id, username || 'Anonymous', '', 'active');
  const conv = db.prepare('SELECT * FROM conversations WHERE id = ?').get(id);
  res.json(conv);
});

app.get('/api/conversations/:id/messages', (req, res) => {
  const rows = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC').all(req.params.id);
  res.json(rows);
});

app.post('/api/conversations/:id/messages', (req, res) => {
  const { role, content, type } = req.body;
  const messageId = 'msg_' + uuidv4().slice(0, 8);
  db.prepare('INSERT INTO messages (id, conversation_id, role, content, type) VALUES (?, ?, ?, ?, ?)').run(messageId, req.params.id, role, content, type || 'text');
  db.prepare('UPDATE conversations SET last_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(content, req.params.id);
  const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(messageId);
  res.json(msg);
});

// Gemini Chat & Lead Scoring
app.post('/api/chat', async (req, res) => {
  const { conversationId, message } = req.body;
  
  try {
    const historyRows = db.prepare('SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 10').all(conversationId);
    const history = historyRows.map(r => ({
      role: r.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: r.content }]
    }));

    const systemPrompt = `You are a professional sales assistant for VoiceFlow AI, an open-source voice bot platform. 
    Your goal is to handle feature questions, pricing, demo booking, and qualify leads. 
    VoiceFlow AI features: Telegram integration, Gemini 1.5 Flash brain, local Whisper STT/Coqui TTS, lead scoring, and automated campaigns. 
    Pricing: Free to use (open-source), cloud hosting starts at $25/mo. 
    Always be professional, helpful, and concise.`;

    const chat = model.startChat({
      history: history,
      generationConfig: { maxOutputTokens: 500 }
    });

    const result = await chat.sendMessage([
      { text: systemPrompt },
      { text: message }
    ]);
    const aiResponse = result.response.text();

    // Lead Scoring Logic
    const scorePrompt = `Analyze the user's intent and interest level based on this message: "${message}". 
    Return ONLY a single integer from 0 to 100 representing the lead score. 
    High intent (pricing, demo, feature questions) gets higher score. 
    Current score should be influenced by the conversation quality.`;
    
    const scoreResult = await model.generateContent(scorePrompt);
    const rawScore = parseInt(scoreResult.response.text().trim()) || 0;
    const currentConv = db.prepare('SELECT lead_score FROM conversations WHERE id = ?').get(conversationId);
    const newScore = Math.min(100, (currentConv.lead_score + rawScore) / 2 + (rawScore > 70 ? 20 : 0));
    const finalScore = Math.round(newScore);

    db.prepare('UPDATE conversations SET lead_score = ? WHERE id = ?').run(finalScore, conversationId);

    // Auto-create lead if score > 70
    if (finalScore > 70) {
      const existingLead = db.prepare('SELECT id FROM leads WHERE conversation_id = ?').get(conversationId);
      if (!existingLead) {
        const leadId = 'lead_' + uuidv4().slice(0, 8);
        const conv = db.prepare('SELECT username FROM conversations WHERE id = ?').get(conversationId);
        db.prepare('INSERT INTO leads (id, conversation_id, name, telegram_handle, score, status, interest) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .run(leadId, conversationId, conv.username, conv.username, finalScore, 'New', 'High');
      } else {
        db.prepare('UPDATE leads SET score = ? WHERE id = ?').run(finalScore, existingLead.id);
      }
    }

    res.json({ response: aiResponse, score: finalScore });
  } catch (error) {
    console.error('Gemini Error:', error);
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
});

// Leads
app.get('/api/leads', (req, res) => {
  const rows = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
  res.json(rows);
});

app.post('/api/leads', (req, res) => {
  const { name, telegram_handle, email, phone, score, status, interest, notes, conversation_id } = req.body;
  const id = 'lead_' + uuidv4().slice(0, 8);
  db.prepare('INSERT INTO leads (id, conversation_id, name, telegram_handle, email, phone, score, status, interest, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, conversation_id || null, name, telegram_handle || '', email || '', phone || '', score || 0, status || 'New', interest || 'Medium', notes || '');
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
  res.json(lead);
});

app.patch('/api/leads/:id', (req, res) => {
  const { status, notes, score } = req.body;
  if (status !== undefined) db.prepare('UPDATE leads SET status = ? WHERE id = ?').run(status, req.params.id);
  if (notes !== undefined) db.prepare('UPDATE leads SET notes = ? WHERE id = ?').run(notes, req.params.id);
  if (score !== undefined) db.prepare('UPDATE leads SET score = ? WHERE id = ?').run(score, req.params.id);
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  res.json(lead);
});

// Campaigns
app.get('/api/campaigns', (req, res) => {
  const rows = db.prepare('SELECT * FROM campaigns ORDER BY created_at DESC').all();
  res.json(rows);
});

app.post('/api/campaigns', (req, res) => {
  const { name, type, target_audience, message_template, schedule_time } = req.body;
  const id = 'camp_' + uuidv4().slice(0, 8);
  db.prepare('INSERT INTO campaigns (id, name, type, target_audience, message_template, schedule_time, status) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, name, type, target_audience, message_template, schedule_time || null, 'Draft');
  const camp = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(id);
  res.json(camp);
});

app.patch('/api/campaigns/:id', (req, res) => {
  const { status, completed_targets, leads_generated, response_rate } = req.body;
  if (status !== undefined) db.prepare('UPDATE campaigns SET status = ? WHERE id = ?').run(status, req.params.id);
  if (completed_targets !== undefined) db.prepare('UPDATE campaigns SET completed_targets = ? WHERE id = ?').run(completed_targets, req.params.id);
  if (leads_generated !== undefined) db.prepare('UPDATE campaigns SET leads_generated = ? WHERE id = ?').run(leads_generated, req.params.id);
  if (response_rate !== undefined) db.prepare('UPDATE campaigns SET response_rate = ? WHERE id = ?').run(response_rate, req.params.id);
  const camp = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(req.params.id);
  res.json(camp);
});

// Escalations
app.get('/api/escalations', (req, res) => {
  const rows = db.prepare(`
    SELECT e.*, c.username, c.last_message 
    FROM escalations e 
    JOIN conversations c ON e.conversation_id = c.id 
    ORDER BY e.created_at DESC
  `).all();
  res.json(rows);
});

app.patch('/api/escalations/:id', (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE escalations SET status = ? WHERE id = ?').run(status, req.params.id);
  const esc = db.prepare('SELECT * FROM escalations WHERE id = ?').get(req.params.id);
  res.json(esc);
});

// Stats
app.get('/api/stats', (req, res) => {
  const totalConvs = db.prepare('SELECT COUNT(*) as count FROM conversations').get().count;
  const qualifiedLeads = db.prepare("SELECT COUNT(*) as count FROM leads WHERE status != 'Unqualified'").get().count;
  const activeCampaigns = db.prepare("SELECT COUNT(*) as count FROM campaigns WHERE status = 'Running'").get().count;
  const pendingEscalations = db.prepare("SELECT COUNT(*) as count FROM escalations WHERE status = 'Pending'").get().count;
  
  // Real conversation data for charts
  const conversationsLast7Days = db.prepare(`
    SELECT DATE(created_at) as date, COUNT(*) as count 
    FROM conversations 
    WHERE created_at > DATETIME('now', '-7 days') 
    GROUP BY date 
    ORDER BY date ASC
  `).all();

  const leadsPerCampaign = db.prepare(`
    SELECT name, leads_generated 
    FROM campaigns 
    ORDER BY leads_generated DESC 
    LIMIT 5
  `).all();

  res.json({
    total_conversations: totalConvs,
    qualified_leads: qualifiedLeads,
    active_campaigns: activeCampaigns,
    pending_escalations: pendingEscalations,
    chart_conversations: conversationsLast7Days,
    chart_leads: leadsPerCampaign
  });
});

// Twilio Calls
app.get('/api/call-logs', (req, res) => {
  const rows = db.prepare('SELECT * FROM call_logs ORDER BY timestamp DESC').all();
  res.json(rows);
});

app.post('/api/calls/outbound', async (req, res) => {
  const { phoneNumber, conversationId } = req.body;
  try {
    const call = await twilioClient.calls.create({
      url: 'http://demo.twilio.com/docs/voice.xml', // Replace with real TwiML URL for Gemini interaction
      to: phoneNumber,
      from: process.env.VITE_TWILIO_PHONE_NUMBER
    });
    
    const id = 'call_' + uuidv4().slice(0, 8);
    db.prepare('INSERT INTO call_logs (id, conversation_id, phone_number, direction, status) VALUES (?, ?, ?, ?, ?)')
      .run(id, conversationId || null, phoneNumber, 'outbound', 'initiated');
      
    res.json({ sid: call.sid, status: call.status });
  } catch (error) {
    console.error('Twilio Error:', error);
    res.status(500).json({ error: 'Failed to initiate call' });
  }
});

// Incoming Calls Webhook
app.post('/api/calls/incoming', (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say('Hello! You have reached VoiceFlow AI. Our AI assistant is currently unavailable for direct voice interaction in this demo, but we have logged your call.');
  twiml.hangup();
  
  const from = req.body.From;
  const id = 'call_' + uuidv4().slice(0, 8);
  db.prepare('INSERT INTO call_logs (id, phone_number, direction, status) VALUES (?, ?, ?, ?)')
    .run(id, from, 'inbound', 'completed');
    
  res.type('text/xml');
  res.send(twiml.toString());
});

// Settings
app.get('/api/settings', (req, res) => {
  const rows = db.prepare('SELECT * FROM settings').all();
  const settings = {};
  rows.forEach(r => settings[r.key] = r.value);
  res.json(settings);
});

app.post('/api/settings', (req, res) => {
  const settings = req.body;
  const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  Object.keys(settings).forEach(key => upsert.run(key, String(settings[key])));
  res.json({ success: true });
});

app.post('/api/test-gemini', async (req, res) => {
  try {
    const result = await model.generateContent("Hello, test connection.");
    if (result.response.text()) {
      res.json({ connected: true });
    } else {
      res.json({ connected: false });
    }
  } catch (error) {
    res.json({ connected: false, error: error.message });
  }
});

app.post('/api/test-twilio', async (req, res) => {
  try {
    const account = await twilioClient.api.v2010.accounts(process.env.VITE_TWILIO_ACCOUNT_SID).fetch();
    res.json({ connected: account.status === 'active' });
  } catch (error) {
    res.json({ connected: false, error: error.message });
  }
});

app.post('/api/reset-data', (req, res) => {
  db.exec('DELETE FROM messages');
  db.exec('DELETE FROM conversations');
  db.exec('DELETE FROM leads');
  db.exec('DELETE FROM campaigns');
  db.exec('DELETE FROM escalations');
  db.exec('DELETE FROM call_logs');
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`VoiceFlow AI server running on port ${port}`);
});

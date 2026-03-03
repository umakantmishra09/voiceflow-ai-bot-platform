const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'voiceflow.db');
const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    username TEXT,
    last_message TEXT,
    lead_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    is_online INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT,
    role TEXT, -- 'user' or 'assistant'
    content TEXT,
    type TEXT DEFAULT 'text',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    conversation_id TEXT,
    name TEXT,
    telegram_handle TEXT,
    email TEXT,
    phone TEXT,
    score INTEGER,
    status TEXT DEFAULT 'New',
    interest TEXT DEFAULT 'Medium',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    name TEXT,
    type TEXT, -- 'Voice' or 'Text'
    target_audience TEXT,
    message_template TEXT,
    schedule_time DATETIME,
    status TEXT DEFAULT 'Draft', -- 'Running', 'Paused', 'Draft', 'Completed'
    total_targets INTEGER DEFAULT 0,
    completed_targets INTEGER DEFAULT 0,
    leads_generated INTEGER DEFAULT 0,
    response_rate TEXT DEFAULT '0%',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS escalations (
    id TEXT PRIMARY KEY,
    conversation_id TEXT,
    reason TEXT,
    priority TEXT DEFAULT 'Medium', -- 'High', 'Medium', 'Low'
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Resolved'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
  );

  CREATE TABLE IF NOT EXISTS call_logs (
    id TEXT PRIMARY KEY,
    conversation_id TEXT,
    phone_number TEXT,
    direction TEXT, -- 'inbound' or 'outbound'
    duration INTEGER,
    status TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Seed data function
function seedData() {
  const convCount = db.prepare('SELECT COUNT(*) as count FROM conversations').get().count;
  if (convCount > 0) return;

  const sampleConversations = [
    { id: 'conv_1', username: '@alex_dev', last_message: 'Interested in enterprise plan', lead_score: 85, status: 'hot' },
    { id: 'conv_2', username: '@sarah_m', last_message: 'How do I book a demo?', lead_score: 92, status: 'hot' },
    { id: 'conv_3', username: '@mike_ross', last_message: 'Support for local LLMs?', lead_score: 45, status: 'active' },
    { id: 'conv_4', username: '@jake_biz', last_message: 'Frustrated with service!', lead_score: 10, status: 'escalated' },
    { id: 'conv_5', username: '@linda_k', last_message: 'GDPR compliance steps?', lead_score: 65, status: 'active' }
  ];

  const insertConv = db.prepare('INSERT INTO conversations (id, username, last_message, lead_score, status) VALUES (?, ?, ?, ?, ?)');
  sampleConversations.forEach(c => insertConv.run(c.id, c.username, c.last_message, c.lead_score, c.status));

  const sampleMessages = [
    { id: 'msg_1', conversation_id: 'conv_1', role: 'user', content: 'Hi, saw the bot on Telegram.' },
    { id: 'msg_2', conversation_id: 'conv_1', role: 'assistant', content: 'Hello! How can I help?' },
    { id: 'msg_3', conversation_id: 'conv_1', role: 'user', content: 'Interested in enterprise plan' }
  ];
  const insertMsg = db.prepare('INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)');
  sampleMessages.forEach(m => insertMsg.run(m.id, m.conversation_id, m.role, m.content));

  const sampleLeads = [
    { id: 'lead_1', conversation_id: 'conv_1', name: 'Alex Thompson', telegram_handle: '@alex_dev', score: 85, status: 'Qualified', interest: 'High' },
    { id: 'lead_2', conversation_id: 'conv_2', name: 'Sarah Miller', telegram_handle: '@sarah_m', score: 92, status: 'Negotiation', interest: 'High' }
  ];
  const insertLead = db.prepare('INSERT INTO leads (id, conversation_id, name, telegram_handle, score, status, interest) VALUES (?, ?, ?, ?, ?, ?, ?)');
  sampleLeads.forEach(l => insertLead.run(l.id, l.conversation_id, l.name, l.telegram_handle, l.score, l.status, l.interest));

  const sampleCampaigns = [
    { id: 'camp_1', name: 'Cold Outreach v1', type: 'Voice', total_targets: 1000, completed_targets: 750, leads_generated: 42, response_rate: '12.4%', status: 'Running' },
    { id: 'camp_2', name: 'Re-engagement Q1', type: 'Text', total_targets: 500, completed_targets: 120, leads_generated: 15, response_rate: '8.2%', status: 'Paused' }
  ];
  const insertCamp = db.prepare('INSERT INTO campaigns (id, name, type, total_targets, completed_targets, leads_generated, response_rate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  sampleCampaigns.forEach(c => insertCamp.run(c.id, c.name, c.type, c.total_targets, c.completed_targets, c.leads_generated, c.response_rate, c.status));

  const sampleEscalations = [
    { id: 'esc_1', conversation_id: 'conv_4', reason: 'Negative sentiment detected', priority: 'High', status: 'Pending' }
  ];
  const insertEsc = db.prepare('INSERT INTO escalations (id, conversation_id, reason, priority, status) VALUES (?, ?, ?, ?, ?)');
  sampleEscalations.forEach(e => insertEsc.run(e.id, e.conversation_id, e.reason, e.priority, e.status));

  const initialSettings = [
    { key: 'bot_name', value: 'VoiceFlow AI' },
    { key: 'persona', value: 'Professional sales assistant for VoiceFlow AI' },
    { key: 'response_style', value: 'Professional' }
  ];
  const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
  initialSettings.forEach(s => insertSetting.run(s.key, s.value));
}

seedData();

module.exports = db;

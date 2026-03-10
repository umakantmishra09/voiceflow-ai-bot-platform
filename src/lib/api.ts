const API_BASE = 'http://localhost:8000';

export const api = {
  // Stats
  getStats: () => fetch(`${API_BASE}/api/stats`).then(r => r.json()),

  // Conversations
  getConversations: () => fetch(`${API_BASE}/api/conversations`).then(r => r.json()),
  getMessages: (id: string) => fetch(`${API_BASE}/api/conversations/${id}/messages`).then(r => r.json()),
  sendMessage: (id: string, message: string) => fetch(`${API_BASE}/api/conversations/${id}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  }).then(r => r.json()),
  newConversation: (name: string) => fetch(`${API_BASE}/api/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  }).then(r => r.json()),

  // Leads
  getLeads: () => fetch(`${API_BASE}/api/leads`).then(r => r.json()),
  addLead: (data: any) => fetch(`${API_BASE}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  updateLead: (id: string, data: any) => fetch(`${API_BASE}/api/leads/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  // Campaigns
  getCampaigns: () => fetch(`${API_BASE}/api/campaigns`).then(r => r.json()),
  createCampaign: (data: any) => fetch(`${API_BASE}/api/campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  updateCampaign: (id: string, data: any) => fetch(`${API_BASE}/api/campaigns/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  // Escalations
  getEscalations: () => fetch(`${API_BASE}/api/escalations`).then(r => r.json()),
  updateEscalation: (id: string, data: any) => fetch(`${API_BASE}/api/escalations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  // Calls
  makeCall: (phone: string) => fetch(`${API_BASE}/api/calls/outbound`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number: phone })
  }).then(r => r.json()),

  // Chat with Gemini
  chat: (message: string, history: any[]) => fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history })
  }).then(r => r.json()),
};
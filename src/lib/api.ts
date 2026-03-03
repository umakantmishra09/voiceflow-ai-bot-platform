import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

export default api;

export interface Conversation {
  id: string;
  username: string;
  last_message: string;
  lead_score: number;
  status: string;
  is_online: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  type: string;
  created_at: string;
}

export interface Lead {
  id: string;
  conversation_id: string | null;
  name: string;
  telegram_handle: string;
  email: string;
  phone: string;
  score: number;
  status: string;
  interest: string;
  notes: string;
  created_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: string;
  target_audience: string;
  message_template: string;
  schedule_time: string | null;
  status: string;
  total_targets: number;
  completed_targets: number;
  leads_generated: number;
  response_rate: string;
  created_at: string;
}

export interface Escalation {
  id: string;
  conversation_id: string;
  username: string;
  last_message: string;
  reason: string;
  priority: string;
  status: string;
  created_at: string;
}

export interface Stats {
  total_conversations: number;
  qualified_leads: number;
  active_campaigns: number;
  pending_escalations: number;
  chart_conversations: { date: string; count: number }[];
  chart_leads: { name: string; leads_generated: number }[];
}

export interface CallLog {
  id: string;
  conversation_id: string | null;
  phone_number: string;
  direction: string;
  duration: number | null;
  status: string;
  timestamp: string;
}

// Conversation API
export const getConversations = async () => {
  const { data } = await api.get<Conversation[]>('/conversations');
  return data;
};

export const createConversation = async (username: string) => {
  const { data } = await api.post<Conversation>('/conversations', { username });
  return data;
};

export const getMessages = async (id: string) => {
  const { data } = await api.get<Message[]>(`/conversations/${id}/messages`);
  return data;
};

export const addMessage = async (id: string, role: string, content: string, type: string = 'text') => {
  const { data } = await api.post<Message>(`/conversations/${id}/messages`, { role, content, type });
  return data;
};

export const chatWithGemini = async (conversationId: string, message: string) => {
  const { data } = await api.post<{ response: string; score: number }>('/chat', { conversationId, message });
  return data;
};

// Leads API
export const getLeads = async () => {
  const { data } = await api.get<Lead[]>('/leads');
  return data;
};

export const createLead = async (leadData: Partial<Lead>) => {
  const { data } = await api.post<Lead>('/leads', leadData);
  return data;
};

export const updateLead = async (id: string, leadData: Partial<Lead>) => {
  const { data } = await api.patch<Lead>(`/leads/${id}`, leadData);
  return data;
};

// Campaigns API
export const getCampaigns = async () => {
  const { data } = await api.get<Campaign[]>('/campaigns');
  return data;
};

export const createCampaign = async (campaignData: Partial<Campaign>) => {
  const { data } = await api.post<Campaign>('/campaigns', campaignData);
  return data;
};

export const updateCampaign = async (id: string, campaignData: Partial<Campaign>) => {
  const { data } = await api.patch<Campaign>(`/campaigns/${id}`, campaignData);
  return data;
};

// Escalations API
export const getEscalations = async () => {
  const { data } = await api.get<Escalation[]>('/escalations');
  return data;
};

export const updateEscalation = async (id: string, status: string) => {
  const { data } = await api.patch<Escalation>(`/escalations/${id}`, { status });
  return data;
};

// Stats API
export const getStats = async () => {
  const { data } = await api.get<Stats>('/stats');
  return data;
};

// Twilio API
export const getCallLogs = async () => {
  const { data } = await api.get<CallLog[]>('/call-logs');
  return data;
};

export const makeOutboundCall = async (phoneNumber: string, conversationId?: string) => {
  const { data } = await api.post<{ sid: string; status: string }>('/calls/outbound', { phoneNumber, conversationId });
  return data;
};

// Settings API
export const getSettings = async () => {
  const { data } = await api.get<Record<string, string>>('/settings');
  return data;
};

export const saveSettings = async (settings: Record<string, any>) => {
  const { data } = await api.post<{ success: boolean }>('/settings', settings);
  return data;
};

export const testGemini = async () => {
  const { data } = await api.post<{ connected: boolean; error?: string }>('/test-gemini');
  return data;
};

export const testTwilio = async () => {
  const { data } = await api.post<{ connected: boolean; error?: string }>('/test-twilio');
  return data;
};

export const resetData = async () => {
  const { data } = await api.post<{ success: boolean }>('/reset-data');
  return data;
};

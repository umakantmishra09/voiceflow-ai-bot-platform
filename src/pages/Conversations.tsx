import React, { useEffect, useRef } from 'react';
import { MessageSquare, Search, Filter, ChevronRight, MoreVertical, Bot, User, Star, Zap, PhoneCall, Mic, MicOff, Volume2, VolumeX, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

export default function Conversations() {
  const [conversations, setConversations] = React.useState<any[]>([]);
  const [selectedConv, setSelectedConv] = React.useState<any>(null);
  const [messages, setMessages] = React.useState<any[]>([]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [listening, setListening] = React.useState(false);
  const [voiceEnabled, setVoiceEnabled] = React.useState(true);
  const [newName, setNewName] = React.useState('');
  const messagesEndRef = useRef<any>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConv) loadMessages(selectedConv.id);
  }, [selectedConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(data);
      if (data.length > 0) setSelectedConv(data[0]);
    } catch (e) {
      console.error('Failed to load conversations', e);
    }
  };

  const loadMessages = async (id: number) => {
    try {
      const data = await api.getMessages(String(id));
      setMessages(data);
    } catch (e) {
      console.error('Failed to load messages', e);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedConv) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const data = await api.sendMessage(String(selectedConv.id), userMsg);
      const reply = data.reply;
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      if (voiceEnabled) {
        const utter = new SpeechSynthesisUtterance(reply);
        window.speechSynthesis.speak(utter);
      }
      loadConversations();
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not connect to AI.' }]);
    }
    setLoading(false);
  };

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return alert('Speech recognition not supported in this browser. Use Chrome!');
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (e: any) => {
      setInput(e.results[0][0].transcript);
    };
    recognition.start();
  };

  const createNewConversation = async () => {
    const name = prompt('Enter contact name:');
    if (!name) return;
    const conv = await api.newConversation(name);
    await loadConversations();
    setSelectedConv(conv);
  };

  const makeCall = async () => {
    const phone = prompt('Enter phone number to call (e.g. +1234567890):');
    if (!phone) return;
    const result = await api.makeCall(phone);
    if (result.success) alert(`Call initiated! SID: ${result.call_sid}`);
    else alert(`Call failed: ${result.error}`);
  };

  const filtered = conversations.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-10rem)] flex gap-6">
      {/* Sidebar */}
      <div className="w-96 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-card border rounded-lg shadow-sm">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="bg-transparent border-none outline-none text-sm w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Filter className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-primary" />
          </div>
          <button
            onClick={createNewConversation}
            className="p-2 bg-primary text-white rounded-lg hover:opacity-90"
            title="New Conversation"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 bg-card border rounded-xl shadow-sm p-2">
          {filtered.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8">No conversations yet</div>
          )}
          {filtered.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedConv(conv)}
              className={cn(
                "p-4 rounded-lg cursor-pointer transition-all border border-transparent",
                selectedConv?.id === conv.id
                  ? "bg-primary/10 border-primary/20 shadow-sm"
                  : "hover:bg-secondary/50"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold truncate">{conv.name}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">{conv.created_at?.slice(11, 16)}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1 px-2 py-0.5 bg-secondary rounded text-[10px] font-bold text-primary">
                  <Zap className="w-3 h-3" />
                  SCORE: {conv.lead_score}
                </div>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  conv.lead_score > 70 ? 'bg-red-500 animate-pulse' :
                  conv.lead_score > 40 ? 'bg-green-500' : 'bg-gray-400'
                )} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat View */}
      <div className="flex-1 flex flex-col bg-card border rounded-xl shadow-sm overflow-hidden">
        {selectedConv ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-primary">
                  {selectedConv.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold">{selectedConv.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-500 font-medium">Online</span>
                    <span className="text-xs text-muted-foreground border-l pl-2">Score: {selectedConv.lead_score}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors border shadow-sm"
                  title={voiceEnabled ? 'Mute AI voice' : 'Unmute AI voice'}
                >
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button className="p-2 hover:bg-secondary rounded-lg transition-colors border shadow-sm flex items-center gap-2 text-sm font-medium">
                  <Star className="w-4 h-4" /> Save Lead
                </button>
                <button
                  onClick={makeCall}
                  className="p-2 bg-primary text-white rounded-lg transition-all hover:shadow-lg active:scale-95 flex items-center gap-2 text-sm font-medium px-4"
                >
                  <PhoneCall className="w-4 h-4" /> Start Call
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-secondary/10">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No messages yet. Start the conversation!
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex gap-4 max-w-[80%]",
                  msg.role === 'assistant' ? "mr-auto" : "ml-auto flex-row-reverse"
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-full shrink-0 flex items-center justify-center",
                    msg.role === 'assistant' ? "bg-primary text-white" : "bg-secondary text-primary"
                  )}>
                    {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div className={cn(
                    "p-4 rounded-2xl shadow-sm border",
                    msg.role === 'assistant'
                      ? "bg-white rounded-tl-none border-border/50"
                      : "bg-primary text-white rounded-tr-none border-primary/20"
                  )}>
                    <p className="text-sm leading-relaxed">{msg.content || msg.text}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-4 max-w-[80%] mr-auto">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white border shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay:'0ms'}}/>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay:'150ms'}}/>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay:'300ms'}}/>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white flex items-center gap-3 shrink-0">
              <button
                onClick={startListening}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all border",
                  listening ? "bg-red-500 text-white animate-pulse" : "bg-secondary hover:bg-primary hover:text-white"
                )}
              >
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <div className="flex-1 bg-secondary/50 rounded-full px-6 py-3 border focus-within:border-primary transition-all">
                <input
                  type="text"
                  placeholder="Type a message or use mic..."
                  className="bg-transparent border-none outline-none text-sm w-full"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all active:scale-90 disabled:opacity-50"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
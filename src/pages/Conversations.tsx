import React, { useEffect, useState, useRef } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  ChevronRight, 
  MoreVertical,
  Bot,
  User,
  Star,
  Zap,
  PhoneCall,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Plus,
  Loader2,
  Phone,
  X,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  getConversations, 
  getMessages, 
  addMessage, 
  chatWithGemini, 
  Conversation, 
  Message, 
  createConversation,
  makeOutboundCall,
  createLead
} from '@/lib/api';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function Conversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState('');
  const [search, setSearch] = useState('');
  
  // Voice States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(true);
  
  // Dialer State
  const [showDialer, setShowDialer] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.id);
    }
  }, [selectedConv]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  useEffect(() => {
    let interval: any;
    if (isCalling) {
      interval = setInterval(() => setCallTimer(prev => prev + 1), 1000);
    } else {
      setCallTimer(0);
    }
    return () => clearInterval(interval);
  }, [isCalling]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        handleSendMessage(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        toast.error('Voice recognition failed. Try again.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const fetchConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
      if (data.length > 0 && !selectedConv) {
        setSelectedConv(data[0]);
      }
    } catch (error) {
      toast.error('Failed to load conversations');
    } finally {
      setLoadingConvs(false);
    }
  };

  const fetchMessages = async (id: string) => {
    setLoadingMessages(true);
    try {
      const data = await getMessages(id);
      setMessages(data);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (textOverride?: string) => {
    const message = textOverride || inputText;
    if (!message.trim() || !selectedConv || sending) return;

    const currentId = selectedConv.id;
    setInputText('');
    setSending(true);

    try {
      // Save User Message
      const userMsg = await addMessage(currentId, 'user', message);
      setMessages(prev => [...prev, userMsg]);

      // Chat with Gemini
      const aiData = await chatWithGemini(currentId, message);
      
      // Save AI Message
      const aiMsg = await addMessage(currentId, 'assistant', aiData.response);
      setMessages(prev => [...prev, aiMsg]);
      
      // Update score in local state
      setSelectedConv(prev => prev ? { ...prev, lead_score: aiData.score } : null);
      setConversations(prev => prev.map(c => c.id === currentId ? { ...c, lead_score: aiData.score, last_message: aiData.response } : c));

      // Text to Speech
      if (isSpeaking) {
        const utterance = new SpeechSynthesisUtterance(aiData.response);
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const startNewChat = async () => {
    try {
      const username = prompt('Enter contact name/handle:') || 'Anonymous';
      const newConv = await createConversation(username);
      setConversations(prev => [newConv, ...prev]);
      setSelectedConv(newConv);
      toast.success('New conversation started');
      fetchConversations(); // Refresh list to ensure order and data consistency
    } catch (error) {
      toast.error('Failed to create conversation');
    }
  };

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        toast.error('Speech recognition not supported in this browser.');
        return;
      }
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleCall = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }
    setIsCalling(true);
    try {
      await makeOutboundCall(phoneNumber, selectedConv?.id);
      toast.success(`Calling ${phoneNumber}...`);
    } catch (error) {
      toast.error('Failed to initiate call');
      setIsCalling(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const saveToLeads = async () => {
    if (!selectedConv) return;
    try {
      await createLead({
        name: selectedConv.username,
        telegram_handle: selectedConv.username,
        score: selectedConv.lead_score,
        conversation_id: selectedConv.id,
        status: 'Qualified',
        interest: selectedConv.lead_score > 80 ? 'High' : 'Medium'
      });
      toast.success('Added to lead pipeline');
    } catch (error) {
      toast.error('Failed to save lead');
    }
  };

  const filteredConvs = conversations.filter(c => 
    c.username.toLowerCase().includes(search.toLowerCase()) || 
    c.last_message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-10rem)] flex gap-6 animate-fade-in">
      {/* Sidebar List */}
      <div className="w-96 flex flex-col gap-4 hidden md:flex">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-card border rounded-lg shadow-sm focus-within:border-primary transition-all">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="bg-transparent border-none outline-none text-sm w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={startNewChat}
            className="p-2 bg-primary text-white rounded-lg shadow-sm hover:shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 bg-card border rounded-xl shadow-sm p-2 custom-scrollbar">
          {loadingConvs ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : filteredConvs.length > 0 ? (
            filteredConvs.map((conv) => (
              <div 
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={cn(
                  "p-4 rounded-lg cursor-pointer transition-all border border-transparent group relative",
                  selectedConv?.id === conv.id 
                    ? "bg-primary/10 border-primary/20 shadow-sm" 
                    : "hover:bg-secondary/50"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold truncate text-sm">{conv.username}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">
                    {format(new Date(conv.updated_at), 'HH:mm')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                  {conv.last_message || 'No messages yet'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-secondary rounded text-[10px] font-bold text-primary">
                    <Zap className="w-3 h-3" />
                    SCORE: {conv.lead_score}
                  </div>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    conv.lead_score > 70 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
                    conv.lead_score > 30 ? 'bg-green-500' : 'bg-gray-400'
                  )} />
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat View */}
      <div className="flex-1 flex flex-col bg-card border rounded-xl shadow-sm overflow-hidden relative">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between bg-white shrink-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-primary">
                  {selectedConv.username[1]?.toUpperCase() || 'A'}
                </div>
                <div>
                  <h3 className="font-bold text-sm md:text-base">{selectedConv.username}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] md:text-xs text-green-500 font-medium">Online</span>
                    <span className="text-[10px] md:text-xs text-muted-foreground border-l pl-2">via Telegram</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={saveToLeads}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors border shadow-sm flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary"
                >
                  <Star className="w-4 h-4" /> <span className="hidden lg:inline uppercase">Save Lead</span>
                </button>
                <button 
                  onClick={() => setShowDialer(true)}
                  className="p-2 bg-primary text-white rounded-lg transition-all hover:shadow-lg active:scale-95 flex items-center gap-2 text-xs font-bold px-4"
                >
                  <PhoneCall className="w-4 h-4" /> <span className="hidden lg:inline uppercase">Start Call</span>
                </button>
                <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-secondary/10 custom-scrollbar" ref={scrollRef}>
              <div className="flex justify-center">
                <span className="text-[10px] font-bold text-muted-foreground bg-white px-3 py-1 rounded-full border shadow-sm uppercase tracking-wider">
                  Today - {format(new Date(), 'MMMM dd, yyyy')}
                </span>
              </div>

              {messages.map((msg, i) => (
                <div key={msg.id || i} className={cn(
                  "flex gap-4 max-w-[85%] md:max-w-[75%] animate-fade-in",
                  msg.role === 'assistant' ? "mr-auto" : "ml-auto flex-row-reverse text-right"
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-full shrink-0 flex items-center justify-center shadow-sm",
                    msg.role === 'assistant' ? "bg-primary text-white" : "bg-secondary text-primary"
                  )}>
                    {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div className="space-y-1">
                    <div className={cn(
                      "p-4 rounded-2xl shadow-sm border text-sm leading-relaxed",
                      msg.role === 'assistant' 
                        ? "bg-white rounded-tl-none border-border/50 text-left" 
                        : "bg-primary text-white rounded-tr-none border-primary/20 text-right"
                    )}>
                      {msg.content}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      {format(new Date(msg.created_at), 'HH:mm')}
                    </p>
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex gap-4 mr-auto animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none border shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t bg-white flex items-center gap-3 shrink-0">
              <button 
                onClick={() => setIsSpeaking(!isSpeaking)}
                className={cn(
                  "p-3 rounded-full transition-all border shadow-sm",
                  isSpeaking ? "text-primary bg-secondary/50 border-primary/20" : "text-muted-foreground bg-gray-50"
                )}
              >
                {isSpeaking ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              
              <div className="flex-1 bg-secondary/30 rounded-full px-6 py-2 border focus-within:border-primary transition-all flex items-center">
                <input 
                  type="text" 
                  placeholder={isListening ? "Listening..." : "Type to message contact..."} 
                  className="bg-transparent border-none outline-none text-sm w-full py-1"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button 
                  onClick={toggleMic}
                  className={cn(
                    "p-2 rounded-full transition-all",
                    isListening ? "text-red-500 bg-red-50 animate-pulse" : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>
              </div>
              
              <button 
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || sending}
                className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all active:scale-90 disabled:opacity-50 disabled:scale-100"
              >
                {sending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-12 space-y-4">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center">
              <MessageSquare className="w-10 h-10 text-primary opacity-20" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Select a conversation</h3>
              <p className="text-muted-foreground text-sm max-w-xs">Choose a contact from the list to view their history and start chatting.</p>
            </div>
            <button onClick={startNewChat} className="px-6 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:shadow-lg transition-all active:scale-95">
              Start New Chat
            </button>
          </div>
        )}

        {/* Dialer Overlay */}
        {showDialer && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fade-in p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
              <div className="bg-primary p-8 text-center relative">
                <button 
                  onClick={() => { if(!isCalling) setShowDialer(false); }}
                  className="absolute right-4 top-4 text-white/60 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="w-20 h-20 bg-white/20 rounded-full mx-auto flex items-center justify-center mb-4">
                  <Phone className="w-10 h-10 text-white" />
                </div>
                {isCalling ? (
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white tracking-widest">{phoneNumber}</h2>
                    <div className="flex items-center justify-center gap-2 text-white/80 font-mono text-lg">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      {formatTime(callTimer)}
                    </div>
                  </div>
                ) : (
                  <h2 className="text-xl font-bold text-white uppercase tracking-widest">New Outbound Call</h2>
                )}
              </div>
              
              <div className="p-8 space-y-8">
                {!isCalling ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest px-1">Recipient Number</label>
                      <input 
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="w-full text-2xl font-bold tracking-widest text-center py-4 bg-secondary/30 rounded-2xl border-none focus:ring-2 focus:ring-primary outline-none transition-all"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                    <button 
                      onClick={handleCall}
                      className="w-full py-4 bg-green-500 text-white rounded-2xl shadow-xl shadow-green-500/20 font-bold flex items-center justify-center gap-3 hover:bg-green-600 transition-all active:scale-95 text-lg"
                    >
                      <Phone className="w-6 h-6 fill-current" /> DIAL NOW
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                      <button className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-secondary/50 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary">
                          <MicOff className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground uppercase">Mute</span>
                      </button>
                      <button className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-secondary/50 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary">
                          <Clock className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground uppercase">Hold</span>
                      </button>
                    </div>
                    <button 
                      onClick={() => setIsCalling(false)}
                      className="w-full py-4 bg-red-500 text-white rounded-2xl shadow-xl shadow-red-500/20 font-bold flex items-center justify-center gap-3 hover:bg-red-600 transition-all active:scale-95 text-lg"
                    >
                      <Phone className="w-6 h-6 fill-current rotate-[135deg]" /> HANG UP
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
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
  PhoneCall
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mockConversations = [
  { 
    id: 1, 
    user: '@alex_dev', 
    lastMsg: 'I am interested in the enterprise plan, can we hop on a call?', 
    time: '2m ago', 
    score: 85, 
    status: 'hot',
    history: [
      { role: 'user', text: 'Hi, I saw your bot on Telegram.' },
      { role: 'assistant', text: 'Hello! How can I help you today?' },
      { role: 'user', text: 'I am interested in the enterprise plan, can we hop on a call?' },
    ]
  },
  { 
    id: 2, 
    user: '@sarah_m', 
    lastMsg: 'What are the main features of VoiceFlow?', 
    time: '15m ago', 
    score: 42, 
    status: 'active',
    history: [
      { role: 'user', text: 'What are the main features of VoiceFlow?' },
    ]
  },
  { 
    id: 3, 
    user: '@mike_ross', 
    lastMsg: 'Thanks, I will check it out later.', 
    time: '1h ago', 
    score: 15, 
    status: 'closed',
    history: [
      { role: 'user', text: 'Does this support local LLMs?' },
      { role: 'assistant', text: 'Yes, VoiceFlow is designed to run with local Whisper and Coqui models.' },
      { role: 'user', text: 'Thanks, I will check it out later.' },
    ]
  },
];

export default function Conversations() {
  const [selectedConv, setSelectedConv] = React.useState(mockConversations[0]);
  const [search, setSearch] = React.useState('');

  return (
    <div className="h-[calc(100vh-10rem)] flex gap-6">
      {/* Sidebar List */}
      <div className="w-96 flex flex-col gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-card border rounded-lg shadow-sm">
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

        <div className="flex-1 overflow-y-auto space-y-2 bg-card border rounded-xl shadow-sm p-2">
          {mockConversations.map((conv) => (
            <div 
              key={conv.id}
              onClick={() => setSelectedConv(conv)}
              className={cn(
                "p-4 rounded-lg cursor-pointer transition-all border border-transparent",
                selectedConv.id === conv.id 
                  ? "bg-primary/10 border-primary/20 shadow-sm" 
                  : "hover:bg-secondary/50"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold truncate">{conv.user}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">{conv.time}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                {conv.lastMsg}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 px-2 py-0.5 bg-secondary rounded text-[10px] font-bold text-primary">
                  <Zap className="w-3 h-3" />
                  SCORE: {conv.score}
                </div>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  conv.status === 'hot' ? 'bg-red-500 animate-pulse' : 
                  conv.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                )} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat View */}
      <div className="flex-1 flex flex-col bg-card border rounded-xl shadow-sm overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-primary">
              {selectedConv.user[1].toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold">{selectedConv.user}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-green-500 font-medium">Online</span>
                <span className="text-xs text-muted-foreground border-l pl-2">via Telegram</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors border shadow-sm flex items-center gap-2 text-sm font-medium">
              <Star className="w-4 h-4" /> Save Lead
            </button>
            <button className="p-2 bg-primary text-white rounded-lg transition-all hover:shadow-lg active:scale-95 flex items-center gap-2 text-sm font-medium px-4">
              <PhoneCall className="w-4 h-4" /> Start Call
            </button>
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-secondary/10">
          <div className="flex justify-center">
            <span className="text-[10px] font-bold text-muted-foreground bg-white px-3 py-1 rounded-full border shadow-sm uppercase tracking-wider">
              Today - March 02, 2026
            </span>
          </div>

          {selectedConv.history.map((msg, i) => (
            <div key={i} className={cn(
              "flex gap-4 max-w-[80%]",
              msg.role === 'assistant' ? "mr-auto" : "ml-auto flex-row-reverse text-right"
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
                  ? "bg-white rounded-tl-none border-border/50 text-left" 
                  : "bg-primary text-white rounded-tr-none border-primary/20 text-right"
              )}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input Placeholder */}
        <div className="p-4 border-t bg-white flex items-center gap-4 shrink-0">
          <div className="flex-1 bg-secondary/50 rounded-full px-6 py-3 border focus-within:border-primary transition-all">
            <input 
              type="text" 
              placeholder="Type to take over from AI..." 
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
          <button className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all active:scale-90">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

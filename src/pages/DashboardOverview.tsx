import React from 'react';
import { 
  Users, 
  MessageSquare, 
  Target, 
  Zap,
  TrendingUp,
  Clock,
  ChevronRight
} from 'lucide-react';

const stats = [
  { label: 'Total Conversations', value: '1,284', icon: MessageSquare, trend: '+12%', color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Qualified Leads', value: '452', icon: Users, trend: '+5%', color: 'text-primary', bg: 'bg-secondary' },
  { label: 'Campaign ROI', value: '24.8%', icon: Target, trend: '+8%', color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Avg. Response Time', value: '0.8s', icon: Zap, trend: '-15%', color: 'text-purple-600', bg: 'bg-purple-50' },
];

const recentConversations = [
  { id: 1, user: '@alex_dev', text: 'I am interested in the enterprise plan...', score: 85, time: '2m ago' },
  { id: 2, user: '@sarah_m', text: 'How do I book a demo for next week?', score: 92, time: '15m ago' },
  { id: 3, user: '@mike_ross', text: 'Does this support local LLMs?', score: 45, time: '1h ago' },
];

export function DashboardOverview() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={stat.bg + " p-3 rounded-lg"}>
                <stat.icon className={"w-6 h-6 " + stat.color} />
              </div>
              <span className="text-xs font-semibold text-primary px-2 py-1 bg-secondary rounded-full">
                {stat.trend}
              </span>
            </div>
            <h3 className="text-muted-foreground text-sm font-medium">{stat.label}</h3>
            <p className="text-3xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="font-semibold text-lg">Recent Conversations</h2>
              <button className="text-sm text-primary font-medium hover:underline">View all</button>
            </div>
            <div className="divide-y">
              {recentConversations.map((conv) => (
                <div key={conv.id} className="p-6 hover:bg-secondary/20 transition-colors flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center font-bold text-primary">
                      {conv.user[1].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold">{conv.user}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1">{conv.text}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="font-bold">{conv.score}</span>
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {conv.time}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card p-6 rounded-xl border shadow-sm">
              <h3 className="font-semibold mb-4">Campaign Performance</h3>
              <div className="space-y-4">
                <div className="h-4 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[75%]" />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cold Outreach v1</span>
                  <span className="font-bold">75% Complete</span>
                </div>
              </div>
            </div>
            <div className="bg-card p-6 rounded-xl border shadow-sm">
              <h3 className="font-semibold mb-4">AI Summaries (Last 24h)</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Most users are asking about <span className="text-primary font-medium">pricing</span> and <span className="text-primary font-medium">integration capabilities</span>. High interest in Telegram voice features.
              </p>
            </div>
          </div>
        </div>

        {/* Lead Pipeline Summary */}
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <h2 className="font-semibold text-lg mb-6">Hot Leads</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/20 transition-colors cursor-pointer border border-transparent hover:border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    L{i}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">Potential Lead {i}</h4>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${95 - i * 10}%` }} />
                      </div>
                      <span className="text-xs font-bold">{95 - i * 10}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 border rounded-lg text-sm font-medium hover:bg-secondary/50 transition-colors">
              Manage Pipeline
            </button>
          </div>

          <div className="bg-primary p-6 rounded-xl shadow-lg text-primary-foreground relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">Need Support?</h3>
              <p className="text-primary-foreground/80 text-sm mb-4">Our human agents are standing by for escalations.</p>
              <button className="bg-white text-primary px-4 py-2 rounded-lg font-bold text-sm hover:shadow-xl transition-all active:scale-95">
                Go to Escalations
              </button>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
}

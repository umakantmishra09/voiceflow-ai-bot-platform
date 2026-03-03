import React, { useEffect, useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  Target, 
  AlertTriangle,
  TrendingUp,
  Clock,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { getStats, Stats, getConversations, Conversation, getLeads, Lead } from '@/lib/api';
import { format } from 'date-fns';
import { Link } from '@tanstack/react-router';

const COLORS = ['#0D9488', '#2DD4BF', '#14B8A6', '#0F766E', '#134E4A'];

export function DashboardOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentConvs, setRecentConvs] = useState<Conversation[]>([]);
  const [hotLeads, setHotLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsData, convs, leads] = await Promise.all([
        getStats(),
        getConversations(),
        getLeads()
      ]);
      setStats(statsData);
      setRecentConvs(convs.slice(0, 5));
      setHotLeads(leads.filter(l => l.score > 70).slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Conversations', value: stats?.total_conversations || 0, icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Qualified Leads', value: stats?.qualified_leads || 0, icon: Users, color: 'text-primary', bg: 'bg-secondary' },
    { label: 'Active Campaigns', value: stats?.active_campaigns || 0, icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Pending Escalations', value: stats?.pending_escalations || 0, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={stat.bg + " p-3 rounded-lg group-hover:scale-110 transition-transform"}>
                <stat.icon className={"w-6 h-6 " + stat.color} />
              </div>
            </div>
            <h3 className="text-muted-foreground text-sm font-medium">{stat.label}</h3>
            <p className="text-3xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Conversations (Last 7 Days)
            </h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.chart_conversations || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#666' }}
                    tickFormatter={(str) => format(new Date(str), 'MMM d')}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#0D9488" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#0D9488', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#0D9488' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card p-6 rounded-xl border shadow-sm">
              <h2 className="font-semibold text-lg mb-6">Leads per Campaign</h2>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.chart_leads || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                    <Tooltip />
                    <Bar dataKey="leads_generated" radius={[4, 4, 0, 0]}>
                      {(stats?.chart_leads || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-card p-6 rounded-xl border shadow-sm">
              <h2 className="font-semibold text-lg mb-4">AI Activity Insights</h2>
              <div className="space-y-4">
                <div className="p-4 bg-secondary/30 rounded-lg border border-primary/10">
                  <p className="text-sm text-secondary-foreground leading-relaxed">
                    System is identifying <span className="font-bold">Enterprise</span> interest peaks. Most active hour: <span className="font-bold">2:00 PM UTC</span>. AI response quality remains above 94%.
                  </p>
                </div>
                <div className="flex items-center gap-3 p-3 hover:bg-secondary/20 rounded-lg transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Conversion rate</p>
                    <p className="font-bold text-lg">14.2% <span className="text-xs text-green-500 font-normal">+2.1% this week</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Feed */}
        <div className="space-y-8">
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-white">
              <h2 className="font-semibold text-lg">Recent Chats</h2>
              <Link to="/conversations" className="text-xs text-primary font-bold hover:underline">View All</Link>
            </div>
            <div className="divide-y">
              {recentConvs.length > 0 ? recentConvs.map((conv) => (
                <Link 
                  key={conv.id} 
                  to="/conversations"
                  className="p-4 hover:bg-secondary/20 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-primary shrink-0">
                      {conv.username[1]?.toUpperCase() || 'A'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm truncate">{conv.username}</h4>
                      <p className="text-xs text-muted-foreground truncate">{conv.last_message || 'New conversation'}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 font-bold text-sm text-primary">
                      {conv.lead_score}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{format(new Date(conv.updated_at), 'HH:mm')}</span>
                  </div>
                </Link>
              )) : (
                <div className="p-12 text-center">
                  <p className="text-sm text-muted-foreground">No recent conversations</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <h2 className="font-semibold text-lg mb-6">Hot Leads</h2>
            <div className="space-y-4">
              {hotLeads.length > 0 ? hotLeads.map((lead) => (
                <Link key={lead.id} to="/leads" className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/20 transition-colors cursor-pointer border border-transparent hover:border-border group">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold group-hover:scale-110 transition-transform">
                    {lead.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate text-sm">{lead.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${lead.score}%` }} />
                      </div>
                      <span className="text-xs font-bold text-primary">{lead.score}%</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              )) : (
                <p className="text-center text-sm text-muted-foreground py-4">No hot leads yet</p>
              )}
            </div>
            <Link to="/leads" className="w-full mt-6 py-2 block text-center border rounded-lg text-sm font-medium hover:bg-secondary/50 transition-colors">
              Manage Pipeline
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

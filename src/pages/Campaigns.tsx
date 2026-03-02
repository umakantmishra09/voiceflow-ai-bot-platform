import React from 'react';
import { 
  Target, 
  Plus, 
  Search, 
  Play, 
  Pause, 
  Trash2,
  Users,
  MessageSquare,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mockCampaigns = [
  { id: 1, name: 'Cold Outreach v1', status: 'Running', type: 'Voice', total: 1000, completed: 750, responseRate: '12.4%', leads: 42 },
  { id: 2, name: 'Re-engagement Q1', status: 'Paused', type: 'Text', total: 500, completed: 120, responseRate: '8.2%', leads: 15 },
  { id: 3, name: 'Webinar Follow-up', status: 'Draft', type: 'Voice', total: 200, completed: 0, responseRate: '0%', leads: 0 },
];

export default function Campaigns() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Campaign Manager</h2>
          <p className="text-muted-foreground text-sm">Automate your outreach with AI-powered voice and text bots.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:shadow-lg transition-all active:scale-95 text-sm font-medium">
          <Plus className="w-4 h-4" /> Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-secondary rounded-lg">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Campaigns</p>
            <p className="text-2xl font-bold">2</p>
          </div>
        </div>
        <div className="bg-card p-6 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Outreach</p>
            <p className="text-2xl font-bold">1,700</p>
          </div>
        </div>
        <div className="bg-card p-6 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-lg">
            <BarChart3 className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Avg. Conversion</p>
            <p className="text-2xl font-bold">9.8%</p>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search campaigns..." 
              className="w-full pl-10 pr-4 py-2 bg-secondary/50 border rounded-lg text-sm outline-none focus:border-primary transition-all"
            />
          </div>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-secondary/30 text-muted-foreground text-xs uppercase font-bold border-b">
              <th className="px-6 py-4">Campaign Name</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Progress</th>
              <th className="px-6 py-4">Response Rate</th>
              <th className="px-6 py-4">Leads</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mockCampaigns.map((camp) => (
              <tr key={camp.id} className="hover:bg-secondary/10 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary rounded text-primary">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{camp.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{camp.type} Bot</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase border",
                    camp.status === 'Running' ? 'bg-green-50 text-green-600 border-green-100' :
                    camp.status === 'Paused' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    'bg-gray-50 text-gray-500 border-gray-100'
                  )}>
                    {camp.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="w-32">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span>{Math.round((camp.completed / camp.total) * 100)}%</span>
                      <span className="text-muted-foreground">{camp.completed}/{camp.total}</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${(camp.completed / camp.total) * 100}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-semibold">
                  {camp.responseRate}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-primary">
                  {camp.leads}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {camp.status === 'Running' ? (
                      <button className="p-2 hover:bg-secondary rounded-lg transition-colors border shadow-sm">
                        <Pause className="w-4 h-4 text-muted-foreground" />
                      </button>
                    ) : (
                      <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors border border-primary/20 shadow-sm">
                        <Play className="w-4 h-4 text-primary" />
                      </button>
                    )}
                    <button className="p-2 hover:bg-red-50 rounded-lg transition-colors border border-red-100 shadow-sm">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

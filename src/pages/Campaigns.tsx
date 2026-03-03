import React, { useEffect, useState } from 'react';
import { 
  Target, 
  Plus, 
  Search, 
  Play, 
  Pause, 
  Trash2,
  Users,
  MessageSquare,
  BarChart3,
  Loader2,
  X,
  Calendar,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCampaigns, Campaign, createCampaign, updateCampaign } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'Voice',
    target_audience: '',
    message_template: '',
    total_targets: 100
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const data = await getCampaigns();
      setCampaigns(data);
    } catch (error) {
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await createCampaign(newCampaign);
      setCampaigns(prev => [data, ...prev]);
      setShowModal(false);
      setNewCampaign({ name: '', type: 'Voice', target_audience: '', message_template: '', total_targets: 100 });
      toast.success('Campaign created successfully');
    } catch (error) {
      toast.error('Failed to create campaign');
    }
  };

  const toggleCampaign = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Running' ? 'Paused' : 'Running';
    try {
      await updateCampaign(id, { status: newStatus });
      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      toast.success(`Campaign ${newStatus === 'Running' ? 'started' : 'paused'}`);
      
      // Simulate progress if running
      if (newStatus === 'Running') {
        const interval = setInterval(() => {
          setCampaigns(prev => {
            const camp = prev.find(c => c.id === id);
            if (!camp || camp.status !== 'Running' || camp.completed_targets >= camp.total_targets) {
              clearInterval(interval);
              return prev;
            }
            return prev.map(c => c.id === id ? { 
              ...c, 
              completed_targets: Math.min(c.total_targets, c.completed_targets + Math.floor(Math.random() * 5) + 1),
              leads_generated: c.leads_generated + (Math.random() > 0.8 ? 1 : 0),
              response_rate: `${(Math.random() * 5 + 10).toFixed(1)}%`
            } : c);
          });
        }, 3000);
      }
    } catch (error) {
      toast.error('Failed to update campaign');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Campaign Manager</h2>
          <p className="text-muted-foreground text-sm">Automate your outreach with AI-powered voice and text bots.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:shadow-lg transition-all active:scale-95 text-sm font-bold uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" /> Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-xl border shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3 bg-secondary rounded-lg">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Active Campaigns</p>
            <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'Running').length}</p>
          </div>
        </div>
        <div className="bg-card p-6 rounded-xl border shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Total Completed</p>
            <p className="text-2xl font-bold">{campaigns.reduce((acc, c) => acc + c.completed_targets, 0)}</p>
          </div>
        </div>
        <div className="bg-card p-6 rounded-xl border shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3 bg-amber-50 rounded-lg">
            <BarChart3 className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Leads Generated</p>
            <p className="text-2xl font-bold">{campaigns.reduce((acc, c) => acc + c.leads_generated, 0)}</p>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : campaigns.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/30 text-muted-foreground text-[10px] uppercase font-bold border-b tracking-widest">
                <th className="px-6 py-4">Campaign Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Progress</th>
                <th className="px-6 py-4">Response Rate</th>
                <th className="px-6 py-4">Leads</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-secondary/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary rounded text-primary">
                        {camp.type === 'Voice' ? <Target className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{camp.name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold">{camp.type} Bot</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase border",
                      camp.status === 'Running' ? 'bg-green-50 text-green-600 border-green-100 shadow-[0_0_8px_rgba(34,197,94,0.2)]' :
                      camp.status === 'Paused' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-gray-50 text-gray-500 border-gray-100'
                    )}>
                      {camp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-32">
                      <div className="flex justify-between text-[10px] mb-1 font-bold">
                        <span>{Math.round((camp.completed_targets / camp.total_targets) * 100)}%</span>
                        <span className="text-muted-foreground">{camp.completed_targets}/{camp.total_targets}</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full bg-primary transition-all duration-1000",
                            camp.status === 'Running' && "animate-pulse"
                          )} 
                          style={{ width: `${(camp.completed_targets / camp.total_targets) * 100}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold">
                    {camp.response_rate}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-primary">
                    {camp.leads_generated}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => toggleCampaign(camp.id, camp.status)}
                        className={cn(
                          "p-2 rounded-lg transition-all border shadow-sm",
                          camp.status === 'Running' ? "hover:bg-amber-50 border-amber-100 text-amber-600" : "hover:bg-green-50 border-green-100 text-green-600"
                        )}
                      >
                        {camp.status === 'Running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg transition-colors border border-red-100 shadow-sm text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-primary/30">
              <Layers className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-lg">No campaigns found</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">Create your first outreach campaign to start generating leads automatically.</p>
            </div>
            <button onClick={() => setShowModal(true)} className="px-6 py-2 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-widest">
              Create First Campaign
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="bg-primary p-6 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg uppercase tracking-widest">Create AI Campaign</h3>
              <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Campaign Name</label>
                  <input 
                    required
                    className="w-full px-4 py-2 bg-secondary/30 rounded-lg border focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="e.g. Cold Outreach Q2"
                    value={newCampaign.name}
                    onChange={e => setNewCampaign({...newCampaign, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Bot Type</label>
                    <select 
                      className="w-full px-4 py-2 bg-secondary/30 rounded-lg border outline-none cursor-pointer"
                      value={newCampaign.type}
                      onChange={e => setNewCampaign({...newCampaign, type: e.target.value})}
                    >
                      <option value="Voice">Voice Call Bot</option>
                      <option value="Text">Text Message Bot</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Target Size</label>
                    <input 
                      type="number"
                      required
                      className="w-full px-4 py-2 bg-secondary/30 rounded-lg border outline-none"
                      value={newCampaign.total_targets}
                      onChange={e => setNewCampaign({...newCampaign, total_targets: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Target Audience</label>
                  <input 
                    className="w-full px-4 py-2 bg-secondary/30 rounded-lg border outline-none"
                    placeholder="e.g. SaaS Founders, Real Estate Agents"
                    value={newCampaign.target_audience}
                    onChange={e => setNewCampaign({...newCampaign, target_audience: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">AI Message Template</label>
                  <textarea 
                    className="w-full px-4 py-2 bg-secondary/30 rounded-lg border outline-none h-24 resize-none"
                    placeholder="Hi {name}, I noticed you are looking for AI solutions..."
                    value={newCampaign.message_template}
                    onChange={e => setNewCampaign({...newCampaign, message_template: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-secondary/50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:shadow-lg transition-all active:scale-95 shadow-xl shadow-primary/20"
                >
                  Create & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

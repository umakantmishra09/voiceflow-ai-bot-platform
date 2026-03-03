import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  UserCheck, 
  UserX, 
  MessageSquare, 
  Clock,
  ArrowRight,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Search,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getEscalations, Escalation, updateEscalation } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function Escalations() {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Pending');

  useEffect(() => {
    fetchEscalations();
  }, []);

  const fetchEscalations = async () => {
    try {
      const data = await getEscalations();
      setEscalations(data);
    } catch (error) {
      toast.error('Failed to load escalations');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, status: string) => {
    try {
      await updateEscalation(id, status);
      setEscalations(prev => prev.map(e => e.id === id ? { ...e, status } : e));
      toast.success(`Escalation ${status === 'Resolved' ? 'resolved' : 'updated'}`);
    } catch (error) {
      toast.error('Failed to update escalation');
    }
  };

  const filteredEscs = escalations.filter(e => e.status === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Human Escalations</h2>
          <p className="text-muted-foreground text-sm">Monitor and approve AI decisions that require human intervention.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{escalations.filter(e => e.status === 'Pending').length} Pending</span>
          </div>
          <div className="flex bg-card border rounded-lg p-1">
            <button 
              onClick={() => setFilter('Pending')}
              className={cn(
                "px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all",
                filter === 'Pending' ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              Pending
            </button>
            <button 
              onClick={() => setFilter('Resolved')}
              className={cn(
                "px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all",
                filter === 'Resolved' ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              Resolved
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="p-20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filteredEscs.length > 0 ? (
          filteredEscs.map((esc) => (
            <div key={esc.id} className="bg-card border rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
              <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x">
                <div className="p-6 lg:w-80 shrink-0 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center font-bold text-primary text-lg">
                      {esc.username[1]?.toUpperCase() || 'A'}
                    </div>
                    <div>
                      <h4 className="font-bold">{esc.username}</h4>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-bold uppercase">
                        <Clock className="w-3 h-3" /> {format(new Date(esc.created_at), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1.5 block tracking-widest">Reason</label>
                      <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-xl border border-border/50">
                        <AlertTriangle className={cn(
                          "w-4 h-4",
                          esc.priority === 'High' ? "text-red-500" : "text-amber-500"
                        )} />
                        <span className="text-sm font-semibold">{esc.reason}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Priority</label>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase border",
                        esc.priority === 'High' ? "bg-red-50 text-red-600 border-red-100" : 
                        esc.priority === 'Medium' ? "bg-amber-50 text-amber-600 border-amber-100" : 
                        "bg-blue-50 text-blue-600 border-blue-100"
                      )}>
                        {esc.priority}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-1 bg-secondary/10 flex flex-col justify-between">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground block tracking-widest">Last User Message</label>
                    <div className="p-5 bg-white rounded-2xl border shadow-sm relative text-foreground font-medium leading-relaxed italic border-primary/10">
                      "{esc.last_message || 'User has requested help.'}"
                      <div className="absolute -left-2 top-6 w-4 h-4 bg-white border-l border-t rotate-45" />
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {esc.status === 'Pending' ? (
                      <>
                        <div className="flex gap-3 w-full sm:w-auto">
                          <button 
                            onClick={() => handleUpdate(esc.id, 'In Progress')}
                            className="flex-1 sm:flex-none px-6 py-2.5 bg-primary text-white rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-95 text-xs font-bold uppercase tracking-wider"
                          >
                            <UserCheck className="w-4 h-4" /> Take Over
                          </button>
                          <button 
                            onClick={() => handleUpdate(esc.id, 'Resolved')}
                            className="flex-1 sm:flex-none px-6 py-2.5 border bg-white rounded-xl flex items-center justify-center gap-2 hover:bg-secondary/50 transition-colors text-xs font-bold uppercase tracking-wider"
                          >
                            <CheckCircle2 className="w-4 h-4 text-green-500" /> Resolve
                          </button>
                        </div>
                        <button className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
                          <UserX className="w-4 h-4" /> Dismiss
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-widest bg-green-50 px-4 py-2 rounded-full border border-green-100">
                        <CheckCircle2 className="w-4 h-4" /> Resolved by human agent
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-20 text-center bg-card rounded-xl border border-dashed flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-primary/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="font-bold text-xl">All Clear!</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">No pending escalations require your attention at this time.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

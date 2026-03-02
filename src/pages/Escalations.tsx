import React from 'react';
import { 
  AlertTriangle, 
  UserCheck, 
  UserX, 
  MessageSquare, 
  Clock,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mockEscalations = [
  { 
    id: 1, 
    user: '@jake_biz', 
    reason: 'Negative sentiment detected', 
    severity: 'High', 
    time: '2m ago',
    transcript: 'I am really frustrated with the service. I want to speak to a human right now!'
  },
  { 
    id: 2, 
    user: '@linda_k', 
    reason: 'Complex query threshold', 
    severity: 'Medium', 
    time: '12m ago',
    transcript: 'Can you explain the specific legal compliance steps for GDPR in the EU region?'
  },
];

export default function Escalations() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Human Escalations</h2>
          <p className="text-muted-foreground text-sm">Monitor and approve AI decisions that require human intervention.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
          <ShieldAlert className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-tight">2 Pending Review</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {mockEscalations.map((esc) => (
          <div key={esc.id} className="bg-card border rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x">
              <div className="p-6 md:w-80 shrink-0 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-primary">
                    {esc.user[1].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold">{esc.user}</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {esc.time}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Reason for Escalation</label>
                  <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg border border-border/50">
                    <AlertTriangle className={cn(
                      "w-4 h-4",
                      esc.severity === 'High' ? "text-red-500" : "text-amber-500"
                    )} />
                    <span className="text-sm font-medium">{esc.reason}</span>
                  </div>
                </div>
                <div className="pt-2">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                    esc.severity === 'High' ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                  )}>
                    Priority: {esc.severity}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 bg-secondary/10 flex flex-col justify-between">
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground mb-2 block tracking-widest">Last User Message</label>
                  <div className="p-4 bg-white rounded-xl border shadow-sm relative italic text-foreground/80 leading-relaxed">
                    "{esc.transcript}"
                    <div className="absolute -left-2 top-4 w-4 h-4 bg-white border-l border-t rotate-45" />
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <div className="flex gap-3">
                    <button className="px-6 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:shadow-lg transition-all active:scale-95 text-sm font-bold">
                      <UserCheck className="w-4 h-4" /> Take Over
                    </button>
                    <button className="px-6 py-2 border bg-white rounded-lg flex items-center gap-2 hover:bg-secondary/50 transition-colors text-sm font-bold">
                      <ArrowRight className="w-4 h-4" /> Pass to AI
                    </button>
                  </div>
                  <button className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
                    <UserX className="w-4 h-4" /> Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {mockEscalations.length === 0 && (
          <div className="p-12 text-center bg-card rounded-xl border border-dashed flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-primary">
              <UserCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-lg">All Clear!</h3>
              <p className="text-muted-foreground text-sm">No pending escalations require your attention.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

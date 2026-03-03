import React, { useEffect, useState } from 'react';
import { 
  Bot, 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertOctagon,
  Trash2,
  Cpu,
  PhoneCall,
  Zap,
  Globe,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  getSettings, 
  saveSettings, 
  testGemini, 
  testTwilio, 
  resetData 
} from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function Settings() {
  const [settings, setSettings] = useState({
    bot_name: 'VoiceFlow AI',
    persona: 'Professional sales assistant for VoiceFlow AI',
    response_style: 'Professional'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSending] = useState(false);
  const [testingGemini, setTestingGemini] = useState(false);
  const [testingTwilio, setTestingTwilio] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<'idle' | 'connected' | 'error'>('idle');
  const [twilioStatus, setTwilioStatus] = useState<'idle' | 'connected' | 'error'>('idle');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getSettings();
      if (data && Object.keys(data).length > 0) {
        setSettings({
          bot_name: data.bot_name || 'VoiceFlow AI',
          persona: data.persona || 'Professional sales assistant for VoiceFlow AI',
          response_style: data.response_style || 'Professional'
        });
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await saveSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSending(false);
    }
  };

  const handleTestGemini = async () => {
    setTestingGemini(true);
    try {
      const data = await testGemini();
      setGeminiStatus(data.connected ? 'connected' : 'error');
      if (data.connected) toast.success('Gemini AI connected successfully');
      else toast.error('Gemini AI connection failed');
    } catch (error) {
      setGeminiStatus('error');
      toast.error('Gemini connection error');
    } finally {
      setTestingGemini(false);
    }
  };

  const handleTestTwilio = async () => {
    setTestingTwilio(true);
    try {
      const data = await testTwilio();
      setTwilioStatus(data.connected ? 'connected' : 'error');
      if (data.connected) toast.success('Twilio API connected successfully');
      else toast.error('Twilio connection failed');
    } catch (error) {
      setTwilioStatus('error');
      toast.error('Twilio connection error');
    } finally {
      setTestingTwilio(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Are you absolutely sure? This will delete all conversations, messages, leads, and campaigns.')) {
      try {
        await resetData();
        toast.success('All data has been reset');
        window.location.reload();
      } catch (error) {
        toast.error('Failed to reset data');
      }
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">System Settings</h2>
        <p className="text-muted-foreground text-sm">Configure your AI bot persona and API integrations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Connection Status */}
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-6">
            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Integrations</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary rounded-lg">
                    <Cpu className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Gemini 1.5</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">AI Brain</p>
                  </div>
                </div>
                {geminiStatus === 'connected' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : 
                 geminiStatus === 'error' ? <XCircle className="w-5 h-5 text-red-500" /> : 
                 <div className="w-2 h-2 rounded-full bg-gray-300" />}
              </div>
              <button 
                onClick={handleTestGemini}
                disabled={testingGemini}
                className="w-full py-2 bg-secondary/50 border border-primary/10 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-secondary transition-all flex items-center justify-center gap-2"
              >
                {testingGemini ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                Test Gemini
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <PhoneCall className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Twilio API</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Voice/Call</p>
                  </div>
                </div>
                {twilioStatus === 'connected' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : 
                 twilioStatus === 'error' ? <XCircle className="w-5 h-5 text-red-500" /> : 
                 <div className="w-2 h-2 rounded-full bg-gray-300" />}
              </div>
              <button 
                onClick={handleTestTwilio}
                disabled={testingTwilio}
                className="w-full py-2 bg-blue-50/50 border border-blue-100 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                {testingTwilio ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                Test Twilio
              </button>
            </div>
          </div>

          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 space-y-2">
            <div className="flex items-center gap-2 text-amber-600">
              <Zap className="w-4 h-4 fill-current" />
              <h4 className="font-bold text-xs uppercase tracking-widest">Active Plan</h4>
            </div>
            <p className="text-sm font-bold text-amber-900">Open Source (Self-Hosted)</p>
            <p className="text-xs text-amber-700 leading-relaxed">Running on local compute with Whisper & Coqui integration enabled.</p>
          </div>
        </div>

        {/* Main Form */}
        <div className="md:col-span-2 space-y-8">
          <form onSubmit={handleSave} className="bg-card p-8 rounded-2xl border shadow-sm space-y-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Bot Display Name</label>
                  <div className="relative">
                    <Bot className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                    <input 
                      required
                      className="w-full pl-10 pr-4 py-2 bg-secondary/30 rounded-xl border border-transparent focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium"
                      value={settings.bot_name}
                      onChange={e => setSettings({...settings, bot_name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Response Style</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                    <select 
                      className="w-full pl-10 pr-4 py-2 bg-secondary/30 rounded-xl border border-transparent focus:border-primary outline-none cursor-pointer font-medium appearance-none"
                      value={settings.response_style}
                      onChange={e => setSettings({...settings, response_style: e.target.value})}
                    >
                      <option value="Professional">Professional & Concise</option>
                      <option value="Friendly">Friendly & Chatty</option>
                      <option value="Technical">Technical & Detailed</option>
                      <option value="Aggressive">High-Pressure Sales</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Bot Persona / System Prompt</label>
                <textarea 
                  required
                  className="w-full p-4 bg-secondary/30 rounded-xl border border-transparent focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium h-32 resize-none"
                  value={settings.persona}
                  onChange={e => setSettings({...settings, persona: e.target.value})}
                />
                <p className="text-[10px] text-muted-foreground">This defines how the Gemini AI perceives itself and interacts with users.</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-primary/10"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Configuration
              </button>
            </div>
          </form>

          {/* Danger Zone */}
          <div className="bg-red-50 p-8 rounded-2xl border border-red-100 space-y-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertOctagon className="w-6 h-6" />
              <div>
                <h3 className="font-bold text-sm uppercase tracking-widest">Danger Zone</h3>
                <p className="text-xs text-red-500 font-medium">Critical system actions. Be careful.</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white/50 rounded-xl border border-red-100">
              <div>
                <p className="text-sm font-bold text-red-900">Reset System Data</p>
                <p className="text-xs text-red-700">Wipe all logs, messages, leads and campaigns.</p>
              </div>
              <button 
                onClick={handleReset}
                className="w-full sm:w-auto px-6 py-2 bg-red-500 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-500/20"
              >
                <Trash2 className="w-4 h-4 inline mr-2" /> Reset All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

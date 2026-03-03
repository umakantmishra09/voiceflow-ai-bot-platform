import React, { useState } from 'react';
import { Link, Outlet, useLocation } from '@tanstack/react-router';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Target, 
  AlertTriangle, 
  Settings,
  Bot,
  Menu,
  X,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, path: '/' },
  { label: 'Conversations', icon: MessageSquare, path: '/conversations' },
  { label: 'Lead Pipeline', icon: Users, path: '/leads' },
  { label: 'Campaigns', icon: Target, path: '/campaigns' },
  { label: 'Escalations', icon: AlertTriangle, path: '/escalations' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

export function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const activeLabel = navItems.find(item => item.path === location.pathname)?.label || 'Dashboard';

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-all"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 bg-sidebar border-r border-sidebar-border transition-all duration-300 lg:static flex flex-col shadow-2xl lg:shadow-none",
        isSidebarOpen ? "w-72" : "w-20 lg:w-20",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        !isSidebarOpen && "lg:items-center"
      )}>
        <div className="h-20 flex items-center px-6 border-b border-sidebar-border shrink-0 bg-white/50 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 rotate-3">
              <Bot className="w-6 h-6 text-white" />
            </div>
            {isSidebarOpen && (
              <span className="font-black text-xl tracking-tight text-sidebar-foreground whitespace-nowrap bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                VoiceFlow AI
              </span>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-1.5 custom-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center px-4 py-3.5 rounded-2xl transition-all duration-200 group relative",
                location.pathname === item.path 
                  ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]" 
                  : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110", 
                isSidebarOpen ? "mr-4" : "mx-auto"
              )} />
              {isSidebarOpen && (
                <span className="font-bold text-sm tracking-tight capitalize">{item.label}</span>
              )}
              {location.pathname === item.path && !isSidebarOpen && (
                <div className="absolute left-0 w-1.5 h-6 bg-primary rounded-r-full" />
              )}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-sidebar-border bg-white/30">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:flex w-full items-center justify-center p-3 rounded-2xl bg-secondary/50 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all group"
          >
            {isSidebarOpen ? (
              <div className="flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Collapse</span>
              </div>
            ) : (
              <Menu className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            )}
          </button>
          
          <div className="lg:hidden p-4">
             {/* Mobile bottom padding */}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FBFA]">
        <header className="h-20 border-b flex items-center justify-between px-6 lg:px-10 bg-white/80 backdrop-blur-md sticky top-0 z-30 shrink-0 shadow-sm border-sidebar-border/50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2.5 rounded-xl bg-secondary/50 text-foreground border shadow-sm active:scale-95 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="space-y-0.5">
              <h1 className="text-xl lg:text-2xl font-black tracking-tight text-foreground/90 uppercase italic">
                {activeLabel}
              </h1>
              <p className="hidden md:block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                System Version 2.0.4 • Stable
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 bg-green-50 border border-green-100 rounded-2xl shadow-sm">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping" />
              </div>
              <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">AI Brain Active</span>
            </div>
            
            <div className="flex items-center gap-3 pl-3 lg:pl-6 border-l border-sidebar-border/50">
              <div className="text-right hidden xs:block">
                <p className="text-sm font-black tracking-tight leading-none uppercase">Admin Operator</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Verified User</p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/40 p-[1.5px] shadow-lg active:scale-95 transition-all cursor-pointer group">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center font-black text-primary text-sm group-hover:bg-primary group-hover:text-white transition-colors">
                  JD
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

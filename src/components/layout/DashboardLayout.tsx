import React from 'react';
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
  X
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
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col z-20",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border shrink-0">
          <Bot className="w-8 h-8 text-primary shrink-0" />
          {isSidebarOpen && <span className="ml-3 font-bold text-xl tracking-tight text-sidebar-foreground whitespace-nowrap">VoiceFlow AI</span>}
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-3 rounded-lg transition-all group",
                location.pathname === item.path 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", isSidebarOpen ? "mr-3" : "mx-auto")} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b flex items-center justify-between px-8 bg-card shrink-0">
          <h1 className="text-xl font-semibold capitalize">
            {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-full">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-secondary-foreground">Bot Online</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="text-primary font-bold">JD</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-secondary/30">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

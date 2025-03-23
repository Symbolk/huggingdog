
import React from 'react';
import { cn } from "@/lib/utils";
import { agents } from '@/lib/data';
import AgentAvatar from './AgentAvatar';
import { fadeIn, fadeUp } from '@/lib/animations';
import { Home, Bell, Search, User, Settings, LogOut, MessageSquare } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background to-secondary/50">
      {/* Sidebar - Desktop Only */}
      <aside className={cn(
        "hidden md:flex md:w-64 lg:w-72 p-4 flex-col border-r border-border/40 h-screen sticky top-0",
        fadeIn()
      )}>
        <div className="flex items-center gap-3 px-2 mb-6">
          <img 
            src="https://huggingface.co/datasets/huggingface/brand-assets/resolve/main/hf-logo.png" 
            alt="Huggingdog Logo" 
            className="w-10 h-10"
          />
          <h1 className="text-xl font-semibold">Huggingdog</h1>
        </div>
        
        <nav className="space-y-1 mb-6">
          <NavItem icon={<Home size={20} />} label="Home" active />
          <NavItem icon={<Search size={20} />} label="Explore" />
          <NavItem icon={<Bell size={20} />} label="Notifications" />
          <NavItem icon={<MessageSquare size={20} />} label="Messages" />
          <NavItem icon={<User size={20} />} label="Profile" />
          <NavItem icon={<Settings size={20} />} label="Settings" />
        </nav>
        
        <div className="mt-auto">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 px-2">Popular AI Agents</h3>
          <div className="space-y-3">
            {agents.slice(0, 4).map((agent, index) => (
              <div key={agent.id} className={cn("flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer", fadeUp(index + 1))}>
                <AgentAvatar agent={agent} size="sm" />
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{agent.name}</p>
                  <p className="text-xs text-muted-foreground truncate">@{agent.handle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto p-4 md:px-8 py-6">
        {children}
      </main>
      
      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border flex items-center justify-around p-3 z-50">
        <button className="p-2 rounded-full bg-primary/10 text-primary">
          <Home size={20} />
        </button>
        <button className="p-2">
          <Search size={20} />
        </button>
        <button className="p-2">
          <Bell size={20} />
        </button>
        <button className="p-2">
          <User size={20} />
        </button>
      </div>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active }) => {
  return (
    <button 
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors hover:bg-secondary/80",
        active ? "bg-secondary text-primary font-medium" : "text-foreground"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default Layout;

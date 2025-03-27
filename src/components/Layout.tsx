
import React from 'react';
import { cn } from "@/lib/utils";
import { agents } from '@/lib/data';
import AgentAvatar from './AgentAvatar';
import { fadeIn, fadeUp } from '@/lib/animations';
import { Home, Bell, Search, User, Settings, MessageSquare, Bookmark, Database, BrainCircuit, Bot, CircuitBoard, Code } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-tech-dark to-tech-dark/80 cyber-scanline">
      <div className="absolute inset-0 bg-cyber-grid bg-[size:50px_50px] opacity-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-cyber-glow opacity-30 pointer-events-none"></div>
      
      {/* Sidebar - Desktop Only */}
      <aside className={cn(
        "hidden md:flex md:w-64 lg:w-72 p-4 flex-col border-r border-cyber-secondary/20 h-screen sticky top-0 bg-tech-dark/60 backdrop-blur-lg",
        fadeIn()
      )}>
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="relative">
            <img 
              src="/huggingdog.png" 
              alt="Huggingdog Logo" 
              className="w-10 h-10 animate-pulse-slow"
            />
            <div className="absolute -inset-1 rounded-full animate-neon-pulse opacity-70 -z-10"></div>
          </div>
          <h1 className="cyber-text text-xl font-bold tracking-wider">Hugging Dog</h1>
        </div>
        
        <nav className="space-y-1 mb-6">
          <NavItem icon={<Home size={20} />} label={t('nav.home')} active />
          <NavItem icon={<Search size={20} />} label={t('nav.explore')} />
          <NavItem icon={<BrainCircuit size={20} />} label={t('nav.notifications')} />
          <NavItem icon={<Bot size={20} />} label={t('nav.messages')} />
          <NavItem icon={<Database size={20} />} label={t('nav.bookmarks')} />
          <NavItem icon={<CircuitBoard size={20} />} label={t('nav.profile')} />
        </nav>
        
        <button className="cyber-button w-full mt-4 font-cyber text-sm">
          {t('nav.post')}
        </button>
        
        <div className="mt-auto">
          {/* Light/Dark mode toggle can go here */}
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 max-w-screen-xl mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main Feed Area - Takes more space */}
          <div className="flex-1">
            {children}
          </div>
          
          {/* Right Sidebar - Only on desktop */}
          <div className="hidden md:block md:w-80 lg:w-96">
            <div className="sticky top-4 space-y-6">
              {/* Who to follow section */}
              <div className="cyber-card p-4">
                <h2 className="flex items-center gap-2 text-lg font-cyber mb-4 text-cyber-secondary">
                  {t('sidebar.whoToFollow')}
                  <span className="text-cyber-primary">✧</span>
                </h2>
                <div className="space-y-4">
                  {agents.slice(0, 3).map((agent, index) => (
                    <div key={agent.id} className={cn("flex items-center justify-between cyber-highlight", fadeUp(index + 1))}>
                      <div className="flex items-center gap-3">
                        <AgentAvatar agent={agent} size="md" />
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <div className="flex flex-col">
                            <p className="text-sm text-muted-foreground">@{agent.handle}</p>
                            <p className="text-xs text-cyber-secondary">{agent.model}</p>
                          </div>
                        </div>
                      </div>
                      <button className="cyber-badge px-4 py-1.5 rounded-full border border-cyber-secondary/30 hover:border-cyber-secondary bg-tech-dark/60 hover:bg-tech-dark transition-colors text-sm font-medium">
                        {t('sidebar.follow')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Trending in AI */}
              <div className="cyber-card p-4">
                <h2 className="flex items-center gap-2 text-lg font-cyber mb-4 text-cyber-secondary">
                  {t('sidebar.trendingInAI')}
                  <span className="text-cyber-primary">✧</span>
                </h2>
                <div className="space-y-3">
                  <div className="space-y-1 cyber-highlight p-2 rounded">
                    <p className="font-medium">#StableDiffusion3</p>
                    <p className="text-sm text-muted-foreground">2,543 {t('sidebar.posts')}</p>
                  </div>
                  <div className="space-y-1 cyber-highlight p-2 rounded">
                    <p className="font-medium">#LLaMA3</p>
                    <p className="text-sm text-muted-foreground">1,892 {t('sidebar.posts')}</p>
                  </div>
                  <div className="space-y-1 cyber-highlight p-2 rounded">
                    <p className="font-medium">#GenerativeAI</p>
                    <p className="text-sm text-muted-foreground">4,216 {t('sidebar.posts')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-tech-dark/80 backdrop-blur-lg border-t border-cyber-secondary/30 flex items-center justify-around p-3 z-50">
        <button className="p-2 rounded-full bg-cyber-secondary/20 text-cyber-secondary">
          <Home size={20} />
        </button>
        <button className="p-2">
          <Search size={20} />
        </button>
        <button className="p-2">
          <BrainCircuit size={20} />
        </button>
        <button className="p-2">
          <Bot size={20} />
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
        "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors",
        active ? "bg-tech-dark border border-cyber-secondary/40 text-cyber-secondary font-medium shadow-[0_0_10px_rgba(5,217,232,0.2)]" : 
        "text-foreground hover:bg-tech-dark/60 hover:text-cyber-secondary"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default Layout;

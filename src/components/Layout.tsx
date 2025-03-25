import React from 'react';
import { cn } from "@/lib/utils";
import { agents } from '@/lib/data';
import AgentAvatar from './AgentAvatar';
import { fadeIn, fadeUp } from '@/lib/animations';
import { Home, Bell, Search, User, Settings, MessageSquare, Bookmark } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background to-secondary/50">
      {/* Sidebar - Desktop Only */}
      <aside className={cn(
        "hidden md:flex md:w-64 lg:w-72 p-4 flex-col border-r border-border/40 h-screen sticky top-0",
        fadeIn()
      )}>
        <div className="flex items-center gap-3 px-2 mb-8">
          <img 
            src="https://huggingface.co/datasets/huggingface/brand-assets/resolve/main/hf-logo.png" 
            alt="Huggingdog Logo" 
            className="w-10 h-10"
          />
          <h1 className="text-xl font-semibold">Huggingdog</h1>
        </div>
        
        <nav className="space-y-1 mb-6">
          <NavItem icon={<Home size={20} />} label={t('nav.home')} active />
          <NavItem icon={<Search size={20} />} label={t('nav.explore')} />
          <NavItem icon={<Bell size={20} />} label={t('nav.notifications')} />
          <NavItem icon={<MessageSquare size={20} />} label={t('nav.messages')} />
          <NavItem icon={<Bookmark size={20} />} label={t('nav.bookmarks')} />
          <NavItem icon={<User size={20} />} label={t('nav.profile')} />
        </nav>
        
        <button className="tech-button w-full mt-4">
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
              <div className="glass-card p-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                  {t('sidebar.whoToFollow')}
                  <span className="text-tech-blue">✧</span>
                </h2>
                <div className="space-y-4">
                  {agents.slice(0, 3).map((agent, index) => (
                    <div key={agent.id} className={cn("flex items-center justify-between", fadeUp(index + 1))}>
                      <div className="flex items-center gap-3">
                        <AgentAvatar agent={agent} size="md" />
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <div className="flex flex-col">
                            <p className="text-sm text-muted-foreground">@{agent.handle}</p>
                            <p className="text-xs text-tech-blue">{agent.model}</p>
                          </div>
                        </div>
                      </div>
                      <button className="px-4 py-1.5 rounded-full border border-border bg-background hover:bg-secondary transition-colors text-sm font-medium">
                        {t('sidebar.follow')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Trending in AI */}
              <div className="glass-card p-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                  {t('sidebar.trendingInAI')}
                  <span className="text-tech-blue">✧</span>
                </h2>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="font-medium">#StableDiffusion3</p>
                    <p className="text-sm text-muted-foreground">2,543 {t('sidebar.posts')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">#LLaMA3</p>
                    <p className="text-sm text-muted-foreground">1,892 {t('sidebar.posts')}</p>
                  </div>
                  <div className="space-y-1">
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

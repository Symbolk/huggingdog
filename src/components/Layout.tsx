import React from 'react';
import { cn } from "@/lib/utils";
import { fadeIn } from '@/lib/animations';
import { Home, Bell, Search, User } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background to-secondary/50 relative overflow-hidden">
      {/* 添加更多背景装饰 */}
      <div className="absolute top-20 left-10 w-80 h-80 bg-tech-blue/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-tech-purple/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-tech-blue/3 rounded-full blur-2xl -z-10"></div>
      <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-tech-purple/3 rounded-full blur-2xl -z-10"></div>
      
      {/* 添加装饰线条 */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-tech-blue/50 via-tech-purple/50 to-tech-blue/50"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-tech-purple/50 via-tech-blue/50 to-tech-purple/50"></div>
      
      {/* Sidebar - Desktop Only - Currently Hidden */}
      <aside className={cn(
        "hidden", // 修改为隐藏，但保留代码
        // "hidden md:flex md:w-64 lg:w-72 p-4 flex-col border-r border-border/40 h-screen sticky top-0",
        fadeIn()
      )}>
        <div className="flex items-center gap-3 px-2 mb-8">
          <img 
            src="/huggingdog.png" 
            alt="Huggingdog Logo" 
            className="w-10 h-10"
          />
          <h1 className="text-xl font-bold">Hugging Dog</h1>
        </div>
        
        <nav className="space-y-1 mb-6">
          <NavItem icon={<Home size={20} />} label={t('nav.home')} active />
          <NavItem icon={<Search size={20} />} label={t('nav.explore')} />
          <NavItem icon={<Bell size={20} />} label={t('nav.notifications')} />
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
      <main className="flex-1 max-w-[1200px] mx-auto p-4">
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

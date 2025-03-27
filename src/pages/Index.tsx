
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import Feed from '@/components/Feed';
import StatsSummary from '@/components/StatsSummary';
import { fadeIn } from '@/lib/animations';
import { RefreshCw, ZapIcon, Rocket, Cpu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { dataStore } from '@/services/content/dataStore';
import { usePosts } from '@/hooks/usePosts';

const Index: React.FC = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.language.startsWith('zh') ? 'zh' : 'en';
  const [statsHeight, setStatsHeight] = useState(0);
  const { refreshPosts, isLoading } = usePosts();
  
  // 页面加载时从API获取数据
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // 页面加载时直接从API获取数据，而不是使用mock数据
        await dataStore.loadLatestContent(10, language);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };
    
    loadInitialData();
  }, [language]);
  
  // 监听StatsSummary组件高度变化
  useEffect(() => {
    const statsElement = document.getElementById('stats-summary');
    if (statsElement) {
      const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
          setStatsHeight(entry.contentRect.height);
        }
      });
      
      observer.observe(statsElement);
      return () => observer.disconnect();
    }
  }, []);
  
  return (
    <Layout>
      <div className="mb-6 relative">
        {/* Cyberpunk header decoration */}
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-cyber-grid bg-[size:10px_10px] rounded-full mix-blend-overlay opacity-20"></div>
        <div className="absolute -top-4 -right-4 w-16 h-16 bg-cyber-secondary/10 rounded-full blur-xl"></div>
        
        <div className="flex items-center justify-between mb-3 relative">
          <h1 className={`text-2xl font-cyber tracking-wider ${fadeIn()} text-transparent bg-clip-text bg-gradient-to-r from-cyber-secondary to-cyber-primary`}>
            {t('nav.home')}
          </h1>
          <div className="flex gap-2">
            <button className={`px-4 py-2 text-sm font-medium rounded-full ${fadeIn(1)} bg-tech-dark border border-cyber-secondary/40 text-cyber-secondary`}>
              <span className="flex items-center gap-1">
                <ZapIcon size={14} className="text-cyber-secondary" />
                For You
              </span>
            </button>
            <button className={`px-4 py-2 text-sm font-medium rounded-full ${fadeIn(1)} text-muted-foreground hover:text-cyber-secondary hover:border-cyber-secondary/30 border border-transparent`}>
              <span className="flex items-center gap-1">
                <Rocket size={14} /> 
                Following
              </span>
            </button>
          </div>
        </div>
        <div className={`h-1 w-28 bg-gradient-to-r from-cyber-secondary to-cyber-primary rounded-full mt-2 ${fadeIn(2)}`}>
          <div className="h-full w-1/2 bg-cyber-secondary/70 animate-cyber-scan"></div>
        </div>
      </div>
      
      {/* 今日统计数据 - 固定在顶部 */}
      <div id="stats-summary" className="sticky-stats cyber-scanline">
        <div className="relative cyber-card overflow-hidden">
          {/* 刷新按钮移到右上角 */}
          <button 
            className="absolute right-2 top-2 text-cyber-secondary hover:text-cyber-accent p-1 rounded-full hover:bg-tech-dark/70 transition-colors"
            onClick={() => refreshPosts()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <StatsSummary />
        </div>
      </div>
      
      {/* 添加空间以避免内容重叠 */}
      <div style={{ height: `16px` }} className="w-full"></div>
      
      <div className="relative">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-cyber-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-40 -right-20 w-72 h-72 bg-cyber-secondary/5 rounded-full blur-3xl -z-10"></div>
        <Feed />
      </div>
    </Layout>
  );
};

export default Index;

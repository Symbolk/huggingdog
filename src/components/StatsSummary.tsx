import React, { useEffect, useState } from 'react';
import { huggingFaceService } from '../services/api/huggingfaceService';
import { BarChart3, FileText, Database, Layout } from 'lucide-react';
import { fadeIn } from '../lib/animations';
import { useTranslation } from 'react-i18next';

// 统计数据类型
interface StatsData {
  papers: number;
  models: number;
  datasets: number;
  spaces: number;
  isLoading: boolean;
}

const StatsSummary: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatsData>({
    papers: 0,
    models: 0,
    datasets: 0,
    spaces: 0,
    isLoading: true
  });

  // 获取今日数据统计
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 创建获取每个类别最新数据的请求
        const [papers, models, datasets, spaces] = await Promise.allSettled([
          huggingFaceService.getLatestPapers(10),
          huggingFaceService.getLatestModels(10),
          huggingFaceService.getLatestDatasets(10),
          huggingFaceService.getLatestSpaces(10)
        ]);

        // 计算今天添加的项目数量
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const countTodayItems = (items: any[]) => {
          if (!items || !Array.isArray(items)) return 0;
          return items.filter(item => {
            const itemDate = new Date(item.lastModified || item.publicationDate || item.createdAt || 0);
            return itemDate >= today;
          }).length;
        };

        // 提取成功请求的结果
        const papersList = papers.status === 'fulfilled' ? papers.value : [];
        const modelsList = models.status === 'fulfilled' ? models.value : [];
        const datasetsList = datasets.status === 'fulfilled' ? datasets.value : [];
        const spacesList = spaces.status === 'fulfilled' ? spaces.value : [];

        // 更新状态
        setStats({
          papers: countTodayItems(papersList),
          models: countTodayItems(modelsList),
          datasets: countTodayItems(datasetsList),
          spaces: countTodayItems(spacesList),
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchStats();
  }, []);

  // 统计项目配置
  const statItems = [
    { 
      label: t('stats.papers'), 
      count: stats.papers, 
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    { 
      label: t('stats.models'), 
      count: stats.models, 
      icon: <BarChart3 className="h-5 w-5 text-green-500" />,
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    { 
      label: t('stats.datasets'), 
      count: stats.datasets, 
      icon: <Database className="h-5 w-5 text-purple-500" />,
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    { 
      label: t('stats.spaces'), 
      count: stats.spaces, 
      icon: <Layout className="h-5 w-5 text-orange-500" />,
      bgColor: 'bg-orange-100 dark:bg-orange-900/30'
    }
  ];

  if (stats.isLoading) {
    return (
      <div className={`glass-card p-4 ${fadeIn()}`}>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">{t('stats.todayActivity')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex flex-col items-center p-2 rounded-lg animate-pulse bg-secondary/50">
              <div className="w-5 h-5 rounded-full bg-muted-foreground/20 mb-1"></div>
              <div className="h-5 w-8 bg-muted-foreground/20 rounded mb-1"></div>
              <div className="h-3 w-14 bg-muted-foreground/20 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 如果今天没有任何活动，不显示组件
  if (stats.papers === 0 && stats.models === 0 && stats.datasets === 0 && stats.spaces === 0) {
    return null;
  }

  return (
    <div className={`glass-card p-3 ${fadeIn()}`}>
      <h3 className="text-sm font-medium text-muted-foreground mb-1.5">{t('stats.todayActivity')}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {statItems.map((item, index) => (
          <div 
            key={index} 
            className={`flex flex-col items-center p-1.5 rounded-lg ${item.bgColor} ${fadeIn(index + 1)}`}
          >
            {item.icon}
            <span className="text-xl font-bold mt-0.5">{item.count}</span>
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsSummary; 
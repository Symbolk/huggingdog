
import React, { useEffect, useState } from 'react';
import { huggingFaceService } from '../services/api/huggingfaceService';
import { FileText, Database, CircuitBoard, BrainCircuit } from 'lucide-react';
import { fadeIn } from '../lib/animations';
import { useTranslation } from 'react-i18next';
import { HFDataset, HFModel, HFPaper, HFSpace } from '../lib/types';

// 统计数据类型
interface StatsData {
  papers: number;
  models: number;
  datasets: number;
  spaces: number;
  isLoading: boolean;
  timeRange?: string; // 添加时间范围字段
}

const StatsSummary: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatsData>({
    papers: 0,
    models: 0,
    datasets: 0,
    spaces: 0,
    isLoading: true,
    timeRange: ''
  });
  
  // 获取今日数据统计
  useEffect(() => {
    let isMounted = true; // 用于防止组件卸载后设置状态
    
    const fetchStats = async () => {
      try {
        // 创建获取每个类别最新数据的请求
        const [papers, models, datasets, spaces] = await Promise.allSettled([
          huggingFaceService.getLatestPapers(50),
          huggingFaceService.getLatestModels(20),
          huggingFaceService.getLatestDatasets(20),
          huggingFaceService.getLatestSpaces(20)
        ]);
        
        // 计算昨天到今天的数据
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        // 格式化时间范围字符串
        const formatDate = (date: Date) => {
          return `${date.getMonth() + 1}/${date.getDate()}`;
        };
        const timeRangeStr = `${formatDate(yesterday)} - ${formatDate(today)}`;

        // 计算最近发布的项目数量
        const countRecentItems = <T extends HFPaper | HFModel | HFDataset | HFSpace>(items: T[], type: string) => {
          if (!items || !Array.isArray(items)) return 0;
          
          const filteredItems = items.filter(item => {
            let itemDate: Date;
            
            // 针对不同类型的项目，获取日期字段
            if ('publicationDate' in item) {
              itemDate = new Date(item.publicationDate);
            } else if ('lastModified' in item) {
              itemDate = new Date(item.lastModified);
            } else {
              return false; // 如果没有日期信息，则不包括
            }
            
            // 检查日期是否在昨天到今天的范围内
            return itemDate >= yesterday && itemDate <= new Date();
          });

          // 开发模式下打印筛选后的详细结果
          if (process.env.NODE_ENV === 'development') {
            console.log(`筛选后的${type}: `, filteredItems);
            console.log(`时间范围: ${yesterday.toISOString()} - ${today.toISOString()}`);
            if (filteredItems.length > 0) {
              console.log('首个项目日期:', 
                'publicationDate' in filteredItems[0] 
                  ? new Date(filteredItems[0].publicationDate as string).toISOString() 
                  : new Date(filteredItems[0].lastModified as string).toISOString()
              );
            }
          }
          
          return filteredItems.length;
        };

        // 提取成功请求的结果
        const papersList = papers.status === 'fulfilled' ? papers.value : [];
        const modelsList = models.status === 'fulfilled' ? models.value : [];
        const datasetsList = datasets.status === 'fulfilled' ? datasets.value : [];
        const spacesList = spaces.status === 'fulfilled' ? spaces.value : [];

        if (isMounted) {
          // 更新状态
          setStats({
            papers: countRecentItems(papersList, '论文'),
            models: countRecentItems(modelsList, '模型'),
            datasets: countRecentItems(datasetsList, '数据集'),
            spaces: countRecentItems(spacesList, '空间'),
            isLoading: false,
            timeRange: timeRangeStr
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        if (isMounted) {
          setStats(prev => ({ ...prev, isLoading: false }));
        }
      }
    };

    fetchStats();
    
    // 清理函数
    return () => {
      isMounted = false;
    };
  }, []);

  // 统计项目配置
  const statItems = [
    { 
      label: t('stats.papers'), 
      count: stats.papers, 
      icon: <FileText className="h-5 w-5 text-cyber-secondary" />,
      bgColor: 'bg-tech-dark/60 border border-cyber-secondary/30'
    },
    { 
      label: t('stats.models'), 
      count: stats.models, 
      icon: <BrainCircuit className="h-5 w-5 text-cyber-primary" />,
      bgColor: 'bg-tech-dark/60 border border-cyber-primary/30'
    },
    { 
      label: t('stats.datasets'), 
      count: stats.datasets, 
      icon: <Database className="h-5 w-5 text-[#D946EF]" />,
      bgColor: 'bg-tech-dark/60 border border-[#D946EF]/30'
    },
    { 
      label: t('stats.spaces'), 
      count: stats.spaces, 
      icon: <CircuitBoard className="h-5 w-5 text-cyber-accent" />,
      bgColor: 'bg-tech-dark/60 border border-cyber-accent/30'
    }
  ];

  if (stats.isLoading) {
    return (
      <div className={`p-3 ${fadeIn()}`}>
        <h3 className="text-sm font-medium text-muted-foreground mb-1.5">{t('stats.todayActivity')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex flex-col items-center p-1.5 rounded-lg animate-pulse bg-tech-dark/50 cyber-border">
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
    <div className={`p-3 ${fadeIn()}`}>
      <h3 className="text-sm font-medium text-cyber-secondary mb-1.5 flex items-center">
        <span className="mr-1 w-1.5 h-1.5 bg-cyber-secondary rounded-full inline-block animate-pulse-slow"></span>
        {stats.timeRange ? `${stats.timeRange} ${t('stats.todayActivity')}` : t('stats.todayActivity')}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {statItems.map((item, index) => (
          <div 
            key={index} 
            className={`flex flex-col items-center p-1.5 rounded-lg cyber-highlight ${item.bgColor} ${fadeIn(index + 1)}`}
          >
            {item.icon}
            <span className="text-xl font-bold mt-0.5 font-cyber">{item.count}</span>
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsSummary; 

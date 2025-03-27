import React from 'react';
import { cn } from '@/lib/utils';
import { RefreshCw, TrendingUp, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTrending } from '@/hooks/useTrending';
import { TrendingTopic } from '@/lib/types';
import { fadeUp } from '@/lib/animations';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TrendingTopicsProps {
  className?: string;
}

const TrendingTopics: React.FC<TrendingTopicsProps> = ({ className }) => {
  const { t } = useTranslation();
  const { 
    analysis, 
    isLoading, 
    lastUpdated, 
    refreshTrending, 
    isStreaming,
    streamingText
  } = useTrending();

  const formatTimestamp = (timestamp: string | Date | null) => {
    if (!timestamp) return t('sidebar.neverUpdated');
    
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    
    // 如果是今天，只显示时间
    const now = new Date();
    const isToday = date.getDate() === now.getDate() && 
                    date.getMonth() === now.getMonth() && 
                    date.getFullYear() === now.getFullYear();
    
    if (isToday) {
      return t('sidebar.updatedAt', { time: date.toLocaleTimeString() });
    }
    
    // 否则显示日期和时间
    return t('sidebar.updatedOn', {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    });
  };

  const getTopicPopularityClass = (popularity: number): string => {
    if (popularity >= 90) return 'text-rose-500';
    if (popularity >= 80) return 'text-orange-500';
    if (popularity >= 70) return 'text-yellow-500';
    if (popularity >= 60) return 'text-green-500';
    return 'text-blue-500';
  };

  const getTopicSizeClass = (index: number): string => {
    if (index === 0) return 'text-xl font-bold';
    if (index === 1) return 'text-lg font-bold';
    if (index === 2) return 'text-base font-bold';
    return 'text-sm font-medium';
  };

  // 创建动画光标效果
  const renderStreamingCursor = () => {
    return (
      <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5" />
    );
  };

  return (
    <div className={cn('glass-card p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          {t('sidebar.trendingInAI')}
          <span className="text-tech-blue">✧</span>
        </h2>
        <button
          onClick={refreshTrending}
          disabled={isLoading || isStreaming}
          className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          title={t('actions.refresh')}
        >
          <RefreshCw className={cn('h-4 w-4', (isLoading || isStreaming) && 'animate-spin')} />
        </button>
      </div>

      {/* 流式生成模式 */}
      {isStreaming && (
        <div className="mb-3">
          <div className="text-sm whitespace-pre-wrap font-mono">
            {streamingText}
            {renderStreamingCursor()}
          </div>
        </div>
      )}

      {/* 最终分析结果 */}
      {!isStreaming && analysis && analysis.topics.length > 0 ? (
        <>
          <div className="space-y-3 mb-3">
            {analysis.topics.map((topic, index) => (
              <TopicItem key={topic.id} topic={topic} index={index} />
            ))}
          </div>
          
          {analysis.summary && (
            <div className="text-xs text-muted-foreground italic mt-4 border-t border-border/30 pt-2">
              {analysis.summary}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground mt-2">
            {formatTimestamp(lastUpdated)}
          </div>
        </>
      ) : (
        !isStreaming && (
          <div className="py-8 text-center text-muted-foreground">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="animate-spin h-6 w-6 mb-2" />
                <p>{t('states.loading')}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <TrendingUp className="h-6 w-6 mb-2" />
                <p>{t('states.noTrendingData')}</p>
                <button
                  onClick={refreshTrending}
                  className="text-primary hover:underline text-sm mt-1"
                >
                  {t('actions.generateNow')}
                </button>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

interface TopicItemProps {
  topic: TrendingTopic;
  index: number;
}

const TopicItem: React.FC<TopicItemProps> = ({ topic, index }) => {
  const getTopicPopularityClass = (popularity: number): string => {
    if (popularity >= 90) return 'text-rose-500';
    if (popularity >= 80) return 'text-orange-500';
    if (popularity >= 70) return 'text-yellow-500';
    if (popularity >= 60) return 'text-green-500';
    return 'text-blue-500';
  };

  const getTopicSizeClass = (index: number): string => {
    if (index === 0) return 'text-xl font-bold';
    if (index === 1) return 'text-lg font-bold';
    if (index === 2) return 'text-base font-bold';
    return 'text-sm font-medium';
  };

  const renderPopularityBar = (popularity: number) => {
    return (
      <div className="w-full h-1.5 bg-secondary/50 rounded-full overflow-hidden mt-1">
        <div 
          className={cn("h-full rounded-full", getTopicPopularityClass(popularity))}
          style={{ width: `${popularity}%`, opacity: 0.7 }}
        />
      </div>
    );
  };
  
  return (
    <div className={cn("space-y-1", fadeUp(index + 1))}>
      <div className="flex items-center gap-2">
        <p className={cn(getTopicSizeClass(index), getTopicPopularityClass(topic.popularity))}>
          {topic.name}
        </p>
        
        {topic.description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground/70 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[250px]">
                <p>{topic.description}</p>
                {topic.relatedTags && topic.relatedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1 text-xs">
                    {topic.relatedTags.map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 bg-secondary/50 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground">{topic.count} 条信息</span>
        <span className={cn("font-medium", getTopicPopularityClass(topic.popularity))}>
          热度 {topic.popularity}
        </span>
      </div>
      
      {renderPopularityBar(topic.popularity)}
    </div>
  );
};

export default TrendingTopics; 
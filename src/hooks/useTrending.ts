import { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingAnalysis } from '@/lib/types';
import { trendingService } from '@/services/content/trendingService';
import { dataStore } from '@/services/content/dataStore';

/**
 * 热点趋势钩子
 * 管理热点话题分析
 */
export function useTrending() {
  const { i18n } = useTranslation();
  const [analysis, setAnalysis] = useState<TrendingAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState<string>('');
  
  // 获取当前语言
  const language = i18n.language.startsWith('zh') ? 'zh' : 'en';

  // 刷新热点分析
  const refreshTrending = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      setIsStreaming(true);
      setStreamingText('');

      // 使用trendingService的流式API
      await trendingService.streamTrendingAnalysis(
        language,
        (token) => {
          // 收到新token时更新流式文本
          setStreamingText(prev => prev + token);
        },
        (result) => {
          // 分析完成时更新结果
          setAnalysis(result);
          setIsStreaming(false);
          
          // 在成功分析热榜后，基于热榜加载相关内容
          // 这里限制为最多10个帖子，以优化性能
          try {
            dataStore.loadLatestContentByTrends(result, 10, language);
          } catch (contentError) {
            console.error('Failed to load content by trends:', contentError);
            // 如果加载失败，我们仍然保留分析结果，不影响热榜的显示
          }
        }
      );
    } catch (e) {
      setError(`Failed to fetch trending analysis: ${e instanceof Error ? e.message : String(e)}`);
      setIsStreaming(false);
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  // 在组件挂载后自动获取热榜数据
  useEffect(() => {
    // 仅当分析为空且不在加载中时自动请求
    if (!analysis && !isLoading) {
      refreshTrending();
    }
  }, [analysis, isLoading, refreshTrending]);

  return {
    analysis,
    isLoading,
    error,
    refreshTrending,
    isStreaming,
    streamingText
  };
} 
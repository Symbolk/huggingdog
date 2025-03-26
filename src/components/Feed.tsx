import React from 'react';
import { cn } from "../lib/utils";
import Post from './Post';
import { fadeUp } from '../lib/animations';
import { usePosts } from '../hooks/usePosts';
import { Button } from './ui/button';
import { RefreshCw, ArrowDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FeedProps {
  className?: string;
  tag?: string; // 可选的标签过滤
}

const Feed: React.FC<FeedProps> = ({ className, tag }) => {
  const { t } = useTranslation();
  const { 
    posts, 
    isLoading, 
    refreshPosts, 
    loadMorePosts, 
    filterPostsByTag 
  } = usePosts();

  // 根据标签过滤帖子
  const displayPosts = tag ? filterPostsByTag(tag) : posts;

  if (isLoading && displayPosts.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        {[1, 2, 3].map((_, index) => (
          <div 
            key={index} 
            className="glass-card p-4 animate-pulse"
          >
            <div className="flex gap-3">
              <div className="rounded-full bg-muted/30 w-10 h-10"></div>
              <div className="flex-1">
                <div className="flex gap-2">
                  <div className="h-4 bg-muted/30 rounded w-24"></div>
                  <div className="h-4 bg-muted/30 rounded w-16"></div>
                </div>
                <div className="mt-2 h-4 bg-muted/30 rounded w-full"></div>
                <div className="mt-1 h-4 bg-muted/30 rounded w-full"></div>
                <div className="mt-1 h-4 bg-muted/30 rounded w-3/4"></div>
                <div className="mt-4 flex justify-between">
                  {[1, 2, 3, 4].map((_, i) => (
                    <div key={i} className="h-4 bg-muted/30 rounded w-8"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => refreshPosts()}
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          {t('refresh')}
        </Button>
        
        {tag && (
          <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            #{tag}
          </div>
        )}
      </div>

      <div className={cn("space-y-4", className)}>
        {displayPosts.length === 0 ? (
          <div className="glass-card p-8 text-center text-muted-foreground">
            {tag ? t('noPostsWithTag') : t('noPosts')}
          </div>
        ) : (
          displayPosts.map((post, index) => (
            <Post 
              key={post.id} 
              post={post} 
              className={fadeUp(index + 1)}
            />
          ))
        )}
      </div>
      
      {displayPosts.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => loadMorePosts()}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <ArrowDown className="h-4 w-4" />
            {t('loadMore')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Feed;

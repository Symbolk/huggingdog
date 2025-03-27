
import React from 'react';
import { cn } from "../lib/utils";
import Post from './Post';
import { fadeUp } from '../lib/animations';
import { usePosts } from '../hooks/usePosts';
import { Button } from './ui/button';
import { ArrowDown, ZapIcon } from 'lucide-react';
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
            className="cyber-card p-4 animate-pulse"
          >
            <div className="flex gap-3">
              <div className="rounded-full bg-tech-dark/80 w-10 h-10 border border-cyber-secondary/20"></div>
              <div className="flex-1">
                <div className="flex gap-2">
                  <div className="h-4 bg-tech-dark/80 rounded w-24 border border-cyber-secondary/20"></div>
                  <div className="h-4 bg-tech-dark/80 rounded w-16 border border-cyber-secondary/20"></div>
                </div>
                <div className="mt-2 h-4 bg-tech-dark/80 rounded w-full border border-cyber-secondary/20"></div>
                <div className="mt-1 h-4 bg-tech-dark/80 rounded w-full border border-cyber-secondary/20"></div>
                <div className="mt-1 h-4 bg-tech-dark/80 rounded w-3/4 border border-cyber-secondary/20"></div>
                <div className="mt-4 flex justify-between">
                  {[1, 2, 3, 4].map((_, i) => (
                    <div key={i} className="h-4 bg-tech-dark/80 rounded w-8 border border-cyber-secondary/20"></div>
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
      {tag && (
        <div className="cyber-badge inline-flex items-center">
          <ZapIcon size={12} className="mr-1 text-cyber-secondary" />
          #{tag}
        </div>
      )}

      <div className={cn("space-y-4", className)}>
        {displayPosts.length === 0 ? (
          <div className="cyber-card p-8 text-center text-muted-foreground">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full border border-cyber-secondary/30 flex items-center justify-center">
              <ZapIcon size={24} className="text-cyber-secondary/70" />
            </div>
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
          <button 
            className="cyber-button px-4 flex items-center gap-1"
            onClick={() => loadMorePosts()}
            disabled={isLoading}
          >
            <ArrowDown className="h-4 w-4" />
            {t('loadMore')}
          </button>
        </div>
      )}
    </div>
  );
};

export default Feed;


import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { posts as initialPosts } from '@/lib/data';
import Post from './Post';
import { fadeUp } from '@/lib/animations';

interface FeedProps {
  className?: string;
}

const Feed: React.FC<FeedProps> = ({ className }) => {
  const [posts, setPosts] = useState(initialPosts);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className={cn("space-y-4 max-w-xl mx-auto", className)}>
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
    <div className={cn("space-y-4 max-w-xl mx-auto", className)}>
      {posts.map((post, index) => (
        <Post 
          key={post.id} 
          post={post} 
          className={fadeUp(index + 1)}
        />
      ))}
    </div>
  );
};

export default Feed;

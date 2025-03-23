
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Post as PostType } from '@/lib/types';
import { Heart, MessageCircle, RefreshCw, ThumbsDown, Reply, MoreHorizontal } from "lucide-react";
import AgentAvatar from './AgentAvatar';
import { scaleIn, fadeUp } from '@/lib/animations';
import { formatDistanceToNow } from 'date-fns';

interface PostProps {
  post: PostType;
  className?: string;
}

const Post: React.FC<PostProps> = ({ post, className }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [dislikesCount, setDislikesCount] = useState(post.dislikes);
  
  const handleLike = () => {
    if (isLiked) {
      setLikesCount(prev => prev - 1);
      setIsLiked(false);
    } else {
      setLikesCount(prev => prev + 1);
      setIsLiked(true);
      
      if (isDisliked) {
        setDislikesCount(prev => prev - 1);
        setIsDisliked(false);
      }
    }
  };
  
  const handleDislike = () => {
    if (isDisliked) {
      setDislikesCount(prev => prev - 1);
      setIsDisliked(false);
    } else {
      setDislikesCount(prev => prev + 1);
      setIsDisliked(true);
      
      if (isLiked) {
        setLikesCount(prev => prev - 1);
        setIsLiked(false);
      }
    }
  };

  const formatContent = (content: string) => {
    // Highlight hashtags
    let formattedContent = content.replace(
      /#(\w+)/g, 
      '<span class="text-primary font-medium">#$1</span>'
    );
    
    // Highlight mentions
    formattedContent = formattedContent.replace(
      /@(\w+)/g, 
      '<span class="text-primary font-medium">@$1</span>'
    );
    
    // Highlight URLs
    formattedContent = formattedContent.replace(
      /(https?:\/\/[^\s]+)/g, 
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary underline">$1</a>'
    );
    
    return formattedContent;
  };

  const formattedTimeAgo = formatDistanceToNow(new Date(post.timestamp), { addSuffix: true });

  return (
    <div className={cn(
      "glass-card p-4 border border-border/40 hover:border-tech-blue/30 transition-colors",
      scaleIn(),
      className
    )}>
      <div className="flex gap-3">
        <AgentAvatar agent={post.agent} size="md" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <h3 className="font-medium">{post.agent.name}</h3>
              <span className="text-muted-foreground text-sm">@{post.agent.handle}</span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-muted-foreground text-xs">{formattedTimeAgo}</span>
            </div>
            <button className="text-muted-foreground hover:text-foreground">
              <MoreHorizontal size={18} />
            </button>
          </div>
          
          <div className="mt-2">
            <div 
              className="text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
            />
            
            {post.images && post.images.length > 0 && (
              <div className="mt-3 rounded-lg overflow-hidden">
                <img 
                  src={post.images[0]} 
                  alt="Post attachment" 
                  className="w-full h-auto object-cover max-h-96"
                />
              </div>
            )}
            
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {post.tags.slice(0, 3).map(tag => (
                  <span 
                    key={tag} 
                    className="bg-secondary/70 text-xs px-2 py-1 rounded-full hover:bg-secondary transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
                {post.tags.length > 3 && (
                  <span className="text-muted-foreground text-xs self-center">
                    +{post.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between mt-4 text-muted-foreground">
              <button 
                onClick={handleLike} 
                className={cn(
                  "flex items-center gap-1 interactive-button", 
                  isLiked ? "text-red-500" : "hover:text-red-500"
                )}
              >
                <Heart size={18} className={isLiked ? "fill-red-500" : ""} />
                <span className="text-xs">{likesCount}</span>
              </button>
              
              <button 
                onClick={handleDislike} 
                className={cn(
                  "flex items-center gap-1 interactive-button", 
                  isDisliked ? "text-blue-500" : "hover:text-blue-500"
                )}
              >
                <ThumbsDown size={18} />
                <span className="text-xs">{dislikesCount}</span>
              </button>
              
              <button 
                onClick={() => setShowComments(!showComments)} 
                className="flex items-center gap-1 interactive-button hover:text-primary"
              >
                <MessageCircle size={18} />
                <span className="text-xs">{post.comments.length}</span>
              </button>
              
              <button className="flex items-center gap-1 interactive-button hover:text-primary">
                <RefreshCw size={18} />
                <span className="text-xs">{post.forwards}</span>
              </button>
              
              <button className="flex items-center gap-1 interactive-button hover:text-primary">
                <Reply size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {showComments && post.comments.length > 0 && (
        <div className="mt-4 pl-12 space-y-3">
          {post.comments.map((comment, index) => (
            <div 
              key={comment.id} 
              className={cn(
                "p-3 bg-secondary/30 rounded-lg",
                fadeUp(index + 1)
              )}
            >
              <div className="flex items-start gap-2">
                <AgentAvatar agent={comment.agent} size="sm" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h4 className="text-sm font-medium">{comment.agent.name}</h4>
                    <span className="text-muted-foreground text-xs">@{comment.agent.handle}</span>
                    <span className="text-muted-foreground text-xs">·</span>
                    <span className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div 
                    className="text-xs mt-1"
                    dangerouslySetInnerHTML={{ __html: formatContent(comment.content) }}
                  />
                  
                  <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                    <button className="flex items-center gap-1 text-xs interactive-button hover:text-red-500">
                      <Heart size={14} />
                      <span>{comment.likes}</span>
                    </button>
                    
                    <button className="flex items-center gap-1 text-xs interactive-button hover:text-blue-500">
                      <ThumbsDown size={14} />
                      <span>{comment.dislikes}</span>
                    </button>
                    
                    <button className="flex items-center gap-1 text-xs interactive-button hover:text-primary">
                      <Reply size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Post;

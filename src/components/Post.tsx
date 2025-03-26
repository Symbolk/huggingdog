import React, { useState, ReactNode } from 'react';
import { cn } from "../lib/utils";
import { Post as PostType } from '../lib/types';
import { Heart, MessageCircle, RefreshCw, ThumbsDown, Reply, MoreHorizontal, Smile } from "lucide-react";
import AgentAvatar from './AgentAvatar';
import { scaleIn, fadeUp } from '../lib/animations';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { usePosts } from '../hooks/usePosts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PostProps {
  post: PostType;
  className?: string;
}

type EmojiType = '👍' | '❤️' | '😄' | '👀';
const EMOJIS: EmojiType[] = ['👍', '❤️', '😄', '👀'];

// 定义代码块的Props类型
type CodeBlockProps = React.ClassAttributes<HTMLElement> & 
  React.HTMLAttributes<HTMLElement> & 
  { inline?: boolean; className?: string; children?: ReactNode };

const Post: React.FC<PostProps> = ({ post, className }) => {
  const { t } = useTranslation();
  const { interactWithPost } = usePosts();
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [dislikesCount, setDislikesCount] = useState(post.dislikes);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactions, setReactions] = useState(post.reactions || {
    '👍': 0,
    '❤️': 0,
    '😄': 0,
    '👀': 0
  });
  const [selectedEmoji, setSelectedEmoji] = useState<EmojiType | null>(null);
  
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
      
      // 调用服务API
      interactWithPost({ postId: post.id, action: 'like' });
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
      
      // 调用服务API
      interactWithPost({ postId: post.id, action: 'dislike' });
    }
  };
  
  const handleEmojiSelect = (emoji: EmojiType) => {
    // 如果已选择了这个表情，则取消选择
    if (selectedEmoji === emoji) {
      setReactions(prev => ({
        ...prev,
        [emoji]: Math.max(0, prev[emoji] - 1)
      }));
      setSelectedEmoji(null);
    } else {
      // 如果已经选择了其他表情，先减少之前表情的计数
      if (selectedEmoji) {
        setReactions(prev => ({
          ...prev,
          [selectedEmoji]: Math.max(0, prev[selectedEmoji] - 1)
        }));
      }
      
      // 增加新选择表情的计数
      setReactions(prev => ({
        ...prev,
        [emoji]: prev[emoji] + 1
      }));
      setSelectedEmoji(emoji);
    }
    
    // 关闭选择器
    setShowEmojiPicker(false);
    
    // 调用服务API
    interactWithPost({ postId: post.id, action: 'react', emoji });
  };
  
  const handleForward = () => {
    // 调用服务API
    interactWithPost({ postId: post.id, action: 'forward' });
  };

  // 处理 Markdown 内容，保留表情符号和特殊格式
  const processContent = (content: string) => {
    return content;
  };

  // 自定义的 Markdown 渲染组件
  const customMarkdownComponents = {
    // 自定义段落渲染，处理 #tags 和 @mentions
    p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
      if (typeof children === 'string') {
        // 处理 hashtags 和 mentions
        const processedText = children
          .replace(/(^|\s)(#\w+)/g, '$1<span class="text-primary font-medium">$2</span>')
          .replace(/(^|\s)(@\w+)/g, '$1<span class="text-primary font-medium">$2</span>');
        
        return (
          <p {...props} dangerouslySetInnerHTML={{ __html: processedText }} />
        );
      }
      return <p {...props}>{children}</p>;
    },
    // 自定义链接渲染
    a: ({ node, ...props }) => (
      <a 
        {...props} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-primary underline"
      />
    ),
    // 自定义代码块渲染，使用正确的类型
    code: ({ inline, className, children, ...props }: CodeBlockProps) => {
      return inline ? 
        <code className="bg-secondary/50 px-1 py-0.5 rounded text-xs" {...props}>
          {children}
        </code> :
        <code className="block bg-secondary/50 p-2 rounded-md text-xs my-2 overflow-x-auto" {...props}>
          {children}
        </code>;
    }
  };

  const formattedTimeAgo = formatDistanceToNow(new Date(post.timestamp), { addSuffix: true });
  
  // 计算总反应数
  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);

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
            <div className="text-sm leading-relaxed post-content">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={customMarkdownComponents}
              >
                {processContent(post.content)}
              </ReactMarkdown>
            </div>
            
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
            
            <div className="mt-4">
              {/* 表情反应区 */}
              {totalReactions > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 text-sm text-muted-foreground">
                  {EMOJIS.filter(emoji => reactions[emoji] > 0).map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiSelect(emoji)}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/40 hover:bg-secondary/60 transition-colors",
                        selectedEmoji === emoji && "ring-1 ring-primary"
                      )}
                    >
                      <span>{emoji}</span>
                      <span className="text-xs font-medium">{reactions[emoji]}</span>
                    </button>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between text-muted-foreground">
                <div className="relative">
                  <button 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="flex items-center gap-1 interactive-button hover:text-primary"
                    title={t('post.react')}
                  >
                    <Smile size={18} />
                  </button>
                  
                  {showEmojiPicker && (
                    <div className="absolute top-full left-0 mt-2 p-2 bg-background border border-border rounded-lg shadow-lg z-10 flex gap-2">
                      {EMOJIS.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => handleEmojiSelect(emoji)}
                          className="text-lg hover:scale-125 transition-transform p-1"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => setShowComments(!showComments)} 
                  className="flex items-center gap-1 interactive-button hover:text-primary"
                  title={t('post.comment')}
                >
                  <MessageCircle size={18} />
                  <span className="text-xs">{post.comments.length}</span>
                </button>
                
                <button 
                  onClick={handleForward}
                  className="flex items-center gap-1 interactive-button hover:text-primary"
                  title={t('post.repost')}
                >
                  <RefreshCw size={18} />
                  <span className="text-xs">{post.forwards}</span>
                </button>
                
                <button 
                  className="flex items-center gap-1 interactive-button hover:text-primary"
                  title={t('post.reply')}
                >
                  <Reply size={18} />
                </button>
              </div>
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
                    <span className="text-muted-foreground text-xs">{formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}</span>
                  </div>
                  
                  <div className="text-sm mt-1 comment-content">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={customMarkdownComponents}
                    >
                      {processContent(comment.content)}
                    </ReactMarkdown>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                    <button className="flex items-center gap-1 text-xs hover:text-red-500">
                      <Heart size={14} />
                      <span>{comment.likes}</span>
                    </button>
                    
                    <button className="flex items-center gap-1 text-xs hover:text-blue-500">
                      <ThumbsDown size={14} />
                      <span>{comment.dislikes}</span>
                    </button>
                    
                    <button className="flex items-center gap-1 text-xs hover:text-primary">
                      <Reply size={14} />
                      <span>{t('post.reply')}</span>
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

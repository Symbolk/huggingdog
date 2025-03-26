import React, { useState, ReactNode, useEffect, useRef } from 'react';
import { cn } from "../lib/utils";
import { Post as PostType, StreamingPost, GenerationStatus, Comment, StreamingComment, Agent } from '../lib/types';
import { MessageCircle, RefreshCw, Reply, MoreHorizontal, Smile } from "lucide-react";
import AgentAvatar from './AgentAvatar';
import { scaleIn, fadeUp } from '../lib/animations';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { usePosts } from '../hooks/usePosts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { agentService } from '../services/agents/agentService';

interface PostProps {
  post: PostType | StreamingPost;
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
  const [showComments, setShowComments] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactions, setReactions] = useState(post.reactions || {
    '👍': 0,
    '❤️': 0,
    '😄': 0,
    '👀': 0
  });
  const [selectedEmoji, setSelectedEmoji] = useState<EmojiType | null>(null);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);
  
  // 检查帖子是否正在生成中
  const isStreaming = 'generationStatus' in post && 
    (post.generationStatus === GenerationStatus.PENDING || 
     post.generationStatus === GenerationStatus.STREAMING);
  
  // 是否正在等待首个token响应
  const isPending = 'generationStatus' in post && post.generationStatus === GenerationStatus.PENDING;
  
  // 当前显示的评论（包括生成中的评论）
  const [visibleComments, setVisibleComments] = useState<(Comment | StreamingComment)[]>([]);
  
  // 更新可见评论
  useEffect(() => {
    if (showComments) {
      setVisibleComments(post.comments);
    }
  }, [post.comments, showComments]);
  
  // 回复框自动获取焦点
  useEffect(() => {
    if (showReplyBox && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [showReplyBox]);
  
  const handleEmojiSelect = (emoji: EmojiType) => {
    // 如果帖子正在生成中，不允许交互
    if (isStreaming) return;
    
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
    // 如果帖子正在生成中，不允许交互
    if (isStreaming) return;
    
    // 调用服务API
    interactWithPost({ postId: post.id, action: 'forward' });
  };
  
  const handleReply = () => {
    // 如果帖子正在生成中，不允许交互
    if (isStreaming) return;
    
    // 显示回复框
    setShowReplyBox(true);
    // 自动展开评论区
    setShowComments(true);
  };
  
  // 提交回复
  const submitReply = async () => {
    if (isStreaming || !replyContent.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // 检查内容中是否有@提及
      const mentionMatches = replyContent.match(/@(\w+)/g);
      
      if (mentionMatches && mentionMatches.length > 0) {
        // 获取所有代理
        const agents = agentService.getAgents();
        
        // 找到被@的代理
        for (const mention of mentionMatches) {
          const handle = mention.substring(1); // 去掉@符号
          const mentionedAgent = agents.find(a => a.handle.toLowerCase() === handle.toLowerCase());
          
          if (mentionedAgent) {
            // 添加用户的评论
            await interactWithPost({ 
              postId: post.id, 
              action: 'comment', 
              comment: replyContent
            });
            
            // 触发被@的代理生成评论
            await interactWithPost({
              postId: post.id,
              action: 'agentReply',
              agentId: mentionedAgent.id
            });
          }
        }
      } else {
        // 普通评论，没有@任何人
        await interactWithPost({ 
          postId: post.id, 
          action: 'comment', 
          comment: replyContent
        });
      }
      
      // 清空并隐藏回复框
      setReplyContent('');
      setShowReplyBox(false);
    } catch (error) {
      console.error('Failed to submit reply:', error);
    } finally {
      setIsSubmitting(false);
    }
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

  // 渲染正在生成中的动画
  const renderStreamingContent = () => {
    // 如果是等待首个token的状态，显示左右移动的动画
    if (isPending) {
      return (
        <div className="my-2 space-y-3">
          <div className="h-4 bg-muted/30 rounded w-full animate-pulse"></div>
          <div className="h-4 bg-muted/30 rounded w-full animate-pulse"></div>
          <div className="h-4 bg-muted/30 rounded w-3/4 animate-pulse"></div>
          <div className="flex items-center">
            <div className="h-1.5 w-6 bg-primary/60 rounded-full animate-[loading_1.5s_infinite]"></div>
          </div>
        </div>
      );
    }
    
    // 如果已经收到部分内容，显示闪烁的光标
    return (
      <div className="my-2">
        <div className="text-sm leading-relaxed post-content">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={customMarkdownComponents}
          >
            {processContent(post.content)}
          </ReactMarkdown>
          <span className="inline-block h-4 w-1.5 bg-primary/80 animate-[cursor-blink_1s_infinite]"></span>
        </div>
      </div>
    );
  };

  // 渲染评论，包括生成中的评论
  const renderComments = () => {
    if (!showComments) return null;
    
    return (
      <div className="mt-4 space-y-3 pt-3 border-t border-border/30">
        {/* 回复框 */}
        {showReplyBox && (
          <div className="flex gap-2 mb-4">
            <AgentAvatar agent={agentService.getCurrentUser()} size="sm" />
            <div className="flex-1">
              <textarea
                ref={replyInputRef}
                className="w-full px-3 py-2 text-sm border border-border/50 rounded-lg bg-background/60 focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder={t('post.reply_placeholder') || "Add a reply..."}
                rows={2}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                disabled={isSubmitting}
              />
              <div className="flex justify-end mt-2 gap-2">
                <button
                  className="text-xs px-3 py-1 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
                  onClick={() => {
                    setShowReplyBox(false);
                    setReplyContent('');
                  }}
                  disabled={isSubmitting}
                >
                  {t('cancel')}
                </button>
                <button
                  className="text-xs px-3 py-1 rounded-md bg-primary/80 hover:bg-primary text-white transition-colors"
                  onClick={submitReply}
                  disabled={!replyContent.trim() || isSubmitting}
                >
                  {isSubmitting ? t('submitting') : t('submit')}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {visibleComments.length > 0 ? (
          visibleComments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <AgentAvatar agent={comment.agent} size="sm" />
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <h4 className="text-sm font-medium">{comment.agent.name}</h4>
                  <span className="text-muted-foreground text-xs">@{comment.agent.handle}</span>
                </div>
                
                {/* 评论内容，处理流式生成中的评论 */}
                {'generationStatus' in comment && 
                (comment.generationStatus === GenerationStatus.PENDING || 
                  comment.generationStatus === GenerationStatus.STREAMING) ? (
                  <div className="text-xs text-muted-foreground mt-1">
                    <div className="h-3 bg-muted/30 rounded w-full animate-pulse"></div>
                    <div className="mt-1 h-3 bg-muted/30 rounded w-2/3 animate-pulse"></div>
                    {comment.generationStatus === GenerationStatus.STREAMING && (
                      <div className="mt-1">
                        <span>{comment.content}</span>
                        <span className="inline-block h-3 w-1 bg-primary/80 animate-[cursor-blink_1s_infinite]"></span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs mt-1">{comment.content}</div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-sm text-muted-foreground py-2">
            {t('post.no_comments')}
          </div>
        )}
      </div>
    );
  };

  // 渲染表情反应
  const renderReactions = () => {
    // 筛选出有计数的表情
    const activeEmojis = EMOJIS.filter(emoji => reactions[emoji] > 0);
    
    if (activeEmojis.length === 0) return null;
    
    return (
      <div className="flex flex-wrap mt-2 gap-2">
        {activeEmojis.map(emoji => (
          <button
            key={emoji}
            className={cn(
              "flex items-center gap-0.5 text-sm py-1 px-2 rounded-full border transition-colors",
              selectedEmoji === emoji 
                ? "border-primary/30 bg-primary/10"
                : "border-border/30 bg-secondary/30 hover:bg-secondary/50"
            )}
            onClick={() => handleEmojiSelect(emoji)}
            disabled={isStreaming}
          >
            <span>{emoji}</span>
            <span className="text-xs">{reactions[emoji]}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={cn(
      "glass-card p-4 border border-border/40 hover:border-tech-blue/30 transition-colors",
      isStreaming ? "border-primary/30" : "",
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
            {/* 根据生成状态显示不同的内容 */}
            {isStreaming ? (
              renderStreamingContent()
            ) : (
              <div className="text-sm leading-relaxed post-content">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={customMarkdownComponents}
                >
                  {processContent(post.content)}
                </ReactMarkdown>
              </div>
            )}
            
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
              <div className="mt-2 flex flex-wrap gap-1.5">
                {post.tags.slice(0, 3).map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="text-xs px-2 py-0.5 rounded-full bg-tech-blue/10 text-tech-blue"
                  >
                    #{tag}
                  </span>
                ))}
                {post.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{post.tags.length - 3} more</span>
                )}
              </div>
            )}
            
            {/* 渲染表情反应 */}
            {renderReactions()}
          </div>
          
          <div className="flex justify-between mt-3 pt-2 border-t border-border/20 text-muted-foreground">
            {/* 表情选择器按钮 */}
            <div className="relative">
              <button 
                className={cn("flex items-center gap-1 text-xs hover:text-tech-blue",
                  isStreaming ? "opacity-50 cursor-not-allowed" : ""
                )}
                onClick={() => !isStreaming && setShowEmojiPicker(!showEmojiPicker)}
                disabled={isStreaming}
              >
                <Smile size={16} />
                <span>{t('post.react')}</span>
              </button>
              
              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-2 bg-background border border-border rounded-lg shadow-lg p-2 z-10">
                  <div className="flex gap-2">
                    {EMOJIS.map(emoji => (
                      <button 
                        key={emoji}
                        className={cn(
                          "text-lg hover:bg-secondary px-2 py-1 rounded-md transition-colors",
                          selectedEmoji === emoji ? "bg-secondary" : ""
                        )}
                        onClick={() => handleEmojiSelect(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* 评论按钮 */}
            <div className="relative">
              <button 
                className={cn("flex items-center gap-1 text-xs hover:text-tech-blue",
                  isStreaming ? "opacity-50 cursor-not-allowed" : ""
                )}
                onClick={() => !isStreaming && setShowComments(!showComments)}
                disabled={isStreaming}
              >
                <MessageCircle size={16} />
                <span>
                  {post.comments.length > 0 
                    ? `${post.comments.length} ${t('post.comments')}` 
                    : t('post.comment')}
                </span>
              </button>
            </div>
            
            {/* 转发按钮 */}
            <button 
              className={cn("flex items-center gap-1 text-xs hover:text-tech-blue",
                isStreaming ? "opacity-50 cursor-not-allowed" : ""
              )}
              onClick={handleForward}
              disabled={isStreaming}
            >
              <RefreshCw size={16} />
              <span>{post.forwards > 0 ? post.forwards : t('post.repost')}</span>
            </button>
            
            {/* 回复按钮 */}
            <button 
              className={cn("flex items-center gap-1 text-xs hover:text-tech-blue",
                isStreaming ? "opacity-50 cursor-not-allowed" : ""
              )}
              onClick={handleReply}
              disabled={isStreaming}
            >
              <Reply size={16} />
              <span>{t('post.reply')}</span>
            </button>
          </div>
          
          {/* 评论区域 - 移到按钮下方 */}
          {renderComments()}
        </div>
      </div>
    </div>
  );
};

export default Post;

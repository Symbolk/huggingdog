import { Post, Comment, GenerationStatus, StreamingPost, StreamingComment, TrendingAnalysis } from '../../lib/types';
import { postGenerator } from './postGenerator';
import { HFPaper, HFModel, HFDataset, HFSpace } from '../../lib/types';
// 不再导入 mock 数据
// import { posts as mockPosts } from '../../lib/data';

/**
 * 数据存储服务
 * 负责管理帖子数据和状态
 */
class DataStore {
  private posts: Post[] = [];
  private streamingPosts: Map<string, StreamingPost> = new Map(); // 存储正在生成中的帖子
  private streamingComments: Map<string, StreamingComment> = new Map(); // 存储正在生成中的评论
  private isLoading: boolean = false;
  private listeners: Set<() => void> = new Set();
  private remainingContent: (HFPaper | HFModel | HFDataset | HFSpace)[] = []; // 存储未被优先选择的内容
  private currentTrends: TrendingAnalysis | null = null; // 存储当前热榜
  private readonly MAX_POSTS = 10; // 最大帖子数量限制

  constructor() {
    // 初始化时不加载 mock 数据，等待 API 调用
    this.posts = [];
  }

  /**
   * 获取所有帖子，包括生成中的帖子
   */
  getPosts(): (Post | StreamingPost)[] {
    // 合并普通帖子和流式生成中的帖子
    const allStreamingPosts = Array.from(this.streamingPosts.values());
    return [...this.posts, ...allStreamingPosts];
  }

  /**
   * 获取生成中的帖子
   */
  getStreamingPosts(): StreamingPost[] {
    return Array.from(this.streamingPosts.values());
  }

  /**
   * 获取生成中的评论
   */
  getStreamingComments(): StreamingComment[] {
    return Array.from(this.streamingComments.values());
  }
  
  /**
   * 添加或更新生成中的帖子
   */
  updateStreamingPost(post: StreamingPost): void {
    this.streamingPosts.set(post.id, post);
    
    // 如果帖子生成完成，将其从streaming列表中移除，添加到普通帖子中
    if (post.generationStatus === GenerationStatus.COMPLETE) {
      this.streamingPosts.delete(post.id);
      
      // 从StreamingPost中提取Post属性，排除generationStatus
      const { generationStatus, ...postWithoutStatus } = post;
      
      this.addPost(postWithoutStatus as Post);
    } else {
      this.notifyListeners();
    }
  }
  
  /**
   * 添加或更新生成中的评论
   */
  updateStreamingComment(postId: string, comment: StreamingComment): void {
    this.streamingComments.set(comment.id, comment);
    
    // 如果评论生成完成，将其从streaming列表中移除，添加到帖子中
    if (comment.generationStatus === GenerationStatus.COMPLETE) {
      this.streamingComments.delete(comment.id);
      
      // 从StreamingComment中提取Comment属性，排除generationStatus
      const { generationStatus, ...commentWithoutStatus } = comment;
      
      this.addCommentToPost(postId, commentWithoutStatus as Comment);
    } else {
      // 更新相关帖子以显示正在生成中的评论
      const post = this.getPostById(postId);
      if (post) {
        this.notifyListeners();
      }
    }
  }

  /**
   * 获取加载状态
   */
  getLoadingState(): boolean {
    return this.isLoading;
  }

  /**
   * 添加新帖子
   */
  addPost(post: Post): void {
    // 将新帖子添加到开头
    this.posts.unshift(post);
    
    // 检查并限制帖子总数
    this.enforcePostLimit();
    
    this.notifyListeners();
  }

  /**
   * 添加多个帖子
   */
  addPosts(newPosts: Post[]): void {
    this.posts = [...newPosts, ...this.posts];
    
    // 检查并限制帖子总数
    this.enforcePostLimit();
    
    this.notifyListeners();
  }

  /**
   * 限制帖子数量，确保不超过最大限制
   */
  private enforcePostLimit(): void {
    // 如果帖子数量超过限制，删除多余的帖子
    if (this.posts.length > this.MAX_POSTS) {
      this.posts = this.posts.slice(0, this.MAX_POSTS);
    }
  }

  /**
   * 更新帖子
   */
  updatePost(updatedPost: Post): void {
    const index = this.posts.findIndex(post => post.id === updatedPost.id);
    if (index !== -1) {
      this.posts[index] = updatedPost;
      this.notifyListeners();
    }
  }

  /**
   * 根据ID获取帖子
   */
  getPostById(id: string): Post | undefined {
    return this.posts.find(post => post.id === id);
  }

  /**
   * 获取指定标签的帖子
   */
  getPostsByTag(tag: string): Post[] {
    return this.posts.filter(post => post.tags.includes(tag));
  }

  /**
   * 添加状态变化监听器
   */
  addListener(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  /**
   * 根据热榜加载最新内容
   * 优先选择与热榜话题相关的内容生成帖子
   */
  async loadLatestContentByTrends(trends: TrendingAnalysis, limit: number = 10, language: 'zh' | 'en' = 'zh'): Promise<void> {
    try {
      // 如果已经在生成中，不重复触发
      if (this.isLoading || this.streamingPosts.size > 0) {
        console.log('Content generation already in progress, skipping request');
        return;
      }
      
      // 清空现有帖子，以便显示新的内容
      this.clearPosts();
      
      this.isLoading = true;
      this.notifyListeners();
      
      // 保存当前热榜，用于后续过滤
      this.currentTrends = trends;

      // 从postGenerator获取所有内容
      const { filteredContent, remainingContent } = await postGenerator.getFilteredContentByTrends(
        trends,
        limit,
        language
      );
      
      // 保存未被选中的内容，供后续加载更多使用
      this.remainingContent = remainingContent;

      // 使用流式生成方法
      await postGenerator.generateMixedPostsFromContentStreaming(filteredContent.slice(0, this.MAX_POSTS), {
        onPostStart: (streamingPost) => {
          // 当帖子开始生成时添加到流式帖子列表
          this.updateStreamingPost(streamingPost);
        },
        onPostUpdate: (streamingPost) => {
          // 当帖子内容更新时更新流式帖子
          this.updateStreamingPost(streamingPost);
        },
        onCommentStart: (postId, streamingComment) => {
          // 当评论开始生成时添加到流式评论列表
          this.updateStreamingComment(postId, streamingComment);
        },
        onCommentUpdate: (postId, streamingComment) => {
          // 当评论内容更新时更新流式评论
          this.updateStreamingComment(postId, streamingComment);
        }
      }, language);
      
    } catch (error) {
      console.error('Failed to load latest content by trends:', error);
      // 如果基于热榜加载失败，回退到常规加载
      this.loadLatestContent(limit, language);
    } finally {
      this.isLoading = false;
      this.notifyListeners();
    }
  }

  /**
   * 加载最新内容
   */
  async loadLatestContent(limit: number = 10, language: 'zh' | 'en' = 'zh'): Promise<void> {
    try {
      // 如果已经在生成中，不重复触发
      if (this.isLoading || this.streamingPosts.size > 0) {
        console.log('Content generation already in progress, skipping request');
        return;
      }
      
      // 清空现有帖子，以便显示新的内容
      this.clearPosts();
      
      this.isLoading = true;
      this.notifyListeners();

      // 使用流式生成方法替代之前的批量生成
      await postGenerator.generateMixedLatestPostsStreaming(Math.min(limit, this.MAX_POSTS), language, {
        onPostStart: (streamingPost) => {
          // 当帖子开始生成时添加到流式帖子列表
          this.updateStreamingPost(streamingPost);
        },
        onPostUpdate: (streamingPost) => {
          // 当帖子内容更新时更新流式帖子
          this.updateStreamingPost(streamingPost);
        },
        onCommentStart: (postId, streamingComment) => {
          // 当评论开始生成时添加到流式评论列表
          this.updateStreamingComment(postId, streamingComment);
        },
        onCommentUpdate: (postId, streamingComment) => {
          // 当评论内容更新时更新流式评论
          this.updateStreamingComment(postId, streamingComment);
        }
      });
      
    } catch (error) {
      console.error('Failed to load latest content:', error);
    } finally {
      this.isLoading = false;
      this.notifyListeners();
    }
  }

  /**
   * 加载更多内容（使用剩余内容）
   */
  async loadMoreContent(limit: number = 5, language: 'zh' | 'en' = 'zh'): Promise<void> {
    try {
      // 如果已经在生成中，不重复触发
      if (this.isLoading || this.streamingPosts.size > 0) {
        console.log('Content generation already in progress, skipping request');
        return;
      }
      
      this.isLoading = true;
      this.notifyListeners();

      // 如果有剩余内容且有当前热榜，优先使用剩余内容
      if (this.remainingContent.length > 0 && this.currentTrends) {
        // 从剩余内容中选择指定数量
        const contentToUse = this.remainingContent.slice(0, Math.min(limit, 5));
        // 更新剩余内容
        this.remainingContent = this.remainingContent.slice(Math.min(limit, 5));
        
        // 从内容生成帖子
        await postGenerator.generateMixedPostsFromContentStreaming(contentToUse, {
          onPostStart: (streamingPost) => {
            this.updateStreamingPost(streamingPost);
          },
          onPostUpdate: (streamingPost) => {
            this.updateStreamingPost(streamingPost);
          },
          onCommentStart: (postId, streamingComment) => {
            this.updateStreamingComment(postId, streamingComment);
          },
          onCommentUpdate: (postId, streamingComment) => {
            this.updateStreamingComment(postId, streamingComment);
          }
        }, language);
      } else {
        // 如果没有剩余内容，使用常规方法获取更多
        await postGenerator.generateMixedLatestPostsStreaming(Math.min(limit, 5), language, {
          onPostStart: (streamingPost) => {
            this.updateStreamingPost(streamingPost);
          },
          onPostUpdate: (streamingPost) => {
            this.updateStreamingPost(streamingPost);
          },
          onCommentStart: (postId, streamingComment) => {
            this.updateStreamingComment(postId, streamingComment);
          },
          onCommentUpdate: (postId, streamingComment) => {
            this.updateStreamingComment(postId, streamingComment);
          }
        });
      }
      
    } catch (error) {
      console.error('Failed to load more content:', error);
    } finally {
      this.isLoading = false;
      this.notifyListeners();
    }
  }

  /**
   * 对帖子执行操作 (点赞、点踩、转发)
   */
  interactWithPost(postId: string, action: 'like' | 'dislike' | 'forward'): void {
    const post = this.getPostById(postId);
    if (!post) return;

    const updatedPost = { ...post };
    
    switch (action) {
      case 'like':
        updatedPost.likes += 1;
        break;
      case 'dislike':
        updatedPost.dislikes += 1;
        break;
      case 'forward':
        updatedPost.forwards += 1;
        break;
    }

    this.updatePost(updatedPost);
  }

  /**
   * 对帖子添加表情反应
   */
  reactToPost(postId: string, emoji: '👍' | '❤️' | '😄' | '👀'): void {
    const post = this.getPostById(postId);
    if (!post) return;

    const updatedPost = { ...post };
    
    if (!updatedPost.reactions) {
      updatedPost.reactions = { '👍': 0, '❤️': 0, '😄': 0, '👀': 0 };
    }
    
    updatedPost.reactions[emoji] += 1;
    
    this.updatePost(updatedPost);
  }

  /**
   * 向帖子添加评论
   */
  addCommentToPost(postId: string, comment: Comment): void {
    const post = this.getPostById(postId);
    if (!post) return;

    const updatedPost = { 
      ...post,
      comments: [...post.comments, comment]
    };
    
    this.updatePost(updatedPost);
  }

  /**
   * 清空所有帖子（仅用于测试）
   */
  clearPosts(): void {
    this.posts = [];
    this.streamingPosts.clear();
    this.streamingComments.clear();
    this.notifyListeners();
  }
}

// 创建单例实例
export const dataStore = new DataStore(); 
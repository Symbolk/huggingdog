import { Post, Comment } from '../../lib/types';
import { postGenerator } from './postGenerator';
// 不再导入 mock 数据
// import { posts as mockPosts } from '../../lib/data';

/**
 * 数据存储服务
 * 负责管理帖子数据和状态
 */
class DataStore {
  private posts: Post[] = [];
  private isLoading: boolean = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    // 初始化时不加载 mock 数据，等待 API 调用
    this.posts = [];
  }

  /**
   * 获取所有帖子
   */
  getPosts(): Post[] {
    return this.posts;
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
    this.posts.unshift(post);
    this.notifyListeners();
  }

  /**
   * 添加多个帖子
   */
  addPosts(newPosts: Post[]): void {
    this.posts = [...newPosts, ...this.posts];
    this.notifyListeners();
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
   * 加载最新内容
   */
  async loadLatestContent(limit: number = 10, language: 'zh' | 'en' = 'zh'): Promise<void> {
    try {
      this.isLoading = true;
      this.notifyListeners();

      const posts = await postGenerator.generateMixedLatestPosts(limit, language);
      
      // 重置帖子列表，或者与现有帖子合并
      this.posts = [...posts];
      
    } catch (error) {
      console.error('Failed to load latest content:', error);
    } finally {
      this.isLoading = false;
      this.notifyListeners();
    }
  }

  /**
   * 加载更多内容
   */
  async loadMoreContent(limit: number = 5, language: 'zh' | 'en' = 'zh'): Promise<void> {
    try {
      this.isLoading = true;
      this.notifyListeners();

      const posts = await postGenerator.generateMixedLatestPosts(limit, language);
      
      // 添加到现有帖子中
      this.posts = [...this.posts, ...posts];
      
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

    // 确保帖子有reactions字段
    if (!post.reactions) {
      post.reactions = {
        '👍': 0,
        '❤️': 0,
        '😄': 0,
        '👀': 0
      };
    }

    const updatedPost = { 
      ...post,
      reactions: {
        ...post.reactions,
        [emoji]: (post.reactions[emoji] || 0) + 1
      }
    };

    this.updatePost(updatedPost);
  }

  /**
   * 添加评论到帖子
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
}

// 创建单例实例
export const dataStore = new DataStore(); 
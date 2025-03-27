import { huggingFaceService } from '../api/huggingfaceService';
import { agentService } from '../agents/agentService';
import { HFDataset, HFModel, HFPaper, HFSpace, Post, StreamingPost, StreamingComment, GenerationStatus, TrendingAnalysis } from '../../lib/types';

// 用于存储过滤后的内容和剩余内容的接口
interface FilteredContent {
  filteredContent: (HFPaper | HFModel | HFDataset | HFSpace)[];
  remainingContent: (HFPaper | HFModel | HFDataset | HFSpace)[];
}

// 流式生成回调接口
interface StreamingCallbacks {
  onPostStart?: (post: StreamingPost) => void;
  onPostUpdate?: (post: StreamingPost) => void;
  onCommentStart?: (postId: string, comment: StreamingComment) => void;
  onCommentUpdate?: (postId: string, comment: StreamingComment) => void;
}

/**
 * 帖子生成器服务
 * 负责从HuggingFace获取内容并生成帖子
 */
class PostGenerator {
  /**
   * 根据热点分析结果过滤内容
   * @param trends 热点分析结果
   * @param limit 需要的内容数量
   * @param language 语言
   * @returns 过滤后的内容和剩余内容
   */
  async getFilteredContentByTrends(
    trends: TrendingAnalysis, 
    limit: number = 10,
    language: 'zh' | 'en' = 'zh'
  ): Promise<FilteredContent> {
    try {
      // 获取所有可用的内容（多获取一些，以便有更多选择空间）
      const paperLimit = Math.max(5, Math.ceil(limit / 2));
      const modelLimit = Math.max(5, Math.ceil(limit / 2));
      const datasetLimit = Math.max(5, Math.ceil(limit / 2));
      const spaceLimit = Math.max(5, Math.ceil(limit / 2));
      
      // 并行获取所有内容
      const [papers, models, datasets, spaces] = await Promise.all([
        huggingFaceService.getLatestPapers(paperLimit * 2),
        huggingFaceService.getLatestModels(modelLimit * 2),
        huggingFaceService.getLatestDatasets(datasetLimit * 2),
        huggingFaceService.getLatestSpaces(spaceLimit * 2)
      ]);

      // 提取热榜关键词
      const trendKeywords = this.extractTrendKeywords(trends);
      
      // 过滤与热榜相关的内容
      const relevantPapers = this.filterContentByRelevance(papers, trendKeywords);
      const relevantModels = this.filterContentByRelevance(models, trendKeywords);
      const relevantDatasets = this.filterContentByRelevance(datasets, trendKeywords);
      const relevantSpaces = this.filterContentByRelevance(spaces, trendKeywords);
      
      // 剩余未过滤的内容
      const remainingPapers = papers.filter(p => !relevantPapers.includes(p));
      const remainingModels = models.filter(m => !relevantModels.includes(m));
      const remainingDatasets = datasets.filter(d => !relevantDatasets.includes(d));
      const remainingSpaces = spaces.filter(s => !relevantSpaces.includes(s));
      
      // 组合所有过滤后的内容，保持多样性（各类型内容均有）
      const allFilteredContent = this.balanceContentTypes(
        relevantPapers, 
        relevantModels, 
        relevantDatasets, 
        relevantSpaces, 
        limit
      );
      
      // 组合所有剩余内容，保持多样性
      const allRemainingContent = this.balanceContentTypes(
        remainingPapers,
        remainingModels,
        remainingDatasets,
        remainingSpaces,
        limit * 2 // 保留更多剩余内容以备后用
      );
      
      return {
        filteredContent: allFilteredContent,
        remainingContent: allRemainingContent
      };
    } catch (error) {
      console.error('Error filtering content by trends:', error);
      // 发生错误时，返回空的过滤结果
      return {
        filteredContent: [],
        remainingContent: []
      };
    }
  }
  
  /**
   * 从已经过滤的内容生成混合帖子
   * @param content 已过滤的内容数组
   * @param callbacks 流式生成回调
   * @param language 语言
   */
  async generateMixedPostsFromContentStreaming(
    content: (HFPaper | HFModel | HFDataset | HFSpace)[],
    callbacks: StreamingCallbacks = {},
    language: 'zh' | 'en' = 'zh'
  ): Promise<void> {
    try {
      if (!content || content.length === 0) {
        console.warn('No content provided to generate posts from');
        return;
      }
      
      // 遍历内容生成帖子
      for (const item of content) {
        try {
          let post: Post;
          
          // 根据内容类型调用相应的生成方法
          if ('summary' in item) {
            // 这是论文
            post = await this.generatePostFromPaper(item as HFPaper, language);
          } else if ('modelId' in item) {
            // 这是模型
            post = await this.generatePostFromModel(item as HFModel, language);
          } else if ('name' in item && !('modelId' in item)) {
            // 这是数据集
            post = await this.generatePostFromDataset(item as HFDataset, language);
          } else {
            // 这是Space
            post = await this.generatePostFromSpace(item as HFSpace, language);
          }
          
          // 创建流式生成帖子对象
          const streamingPost: StreamingPost = {
            ...post,
            content: '',
            generationStatus: GenerationStatus.PENDING
          };
          
          // 触发开始生成回调
          if (callbacks.onPostStart) {
            callbacks.onPostStart(streamingPost);
          }
          
          // 模拟流式生成帖子内容
          const content = post.content;
          let currentContent = '';
          
          // 按字符逐步生成内容
          for (let i = 0; i < content.length; i++) {
            currentContent += content[i];
            
            // 每5个字符更新一次
            if (i % 5 === 0 || i === content.length - 1) {
              const updatedPost: StreamingPost = {
                ...streamingPost,
                content: currentContent,
                generationStatus: i === content.length - 1 
                  ? GenerationStatus.COMPLETE 
                  : GenerationStatus.STREAMING
              };
              
              // 触发更新回调
              if (callbacks.onPostUpdate) {
                callbacks.onPostUpdate(updatedPost);
              }
              
              // 添加适当的延迟使生成效果更自然
              await new Promise(resolve => setTimeout(resolve, 20));
            }
          }
          
          // 为生成的帖子添加评论和互动
          await this.generateInteractionsForPostStreaming(
            post.id,
            post.agent.id,
            callbacks,
            language
          );
          
          // 在帖子之间添加一些延迟，避免同时生成太多帖子
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error('Error generating post from content item:', error);
          // 继续处理下一个内容项
          continue;
        }
      }
    } catch (error) {
      console.error('Error generating mixed posts from content:', error);
      throw error;
    }
  }

  /**
   * 为帖子生成流式互动（评论等）
   */
  private async generateInteractionsForPostStreaming(
    postId: string,
    postAuthorId: string,
    callbacks: StreamingCallbacks,
    language: 'zh' | 'en'
  ): Promise<void> {
    try {
      // 获取除帖子作者外的所有Agent
      const agents = agentService.getAgents()
        .filter(agent => agent.id !== postAuthorId);
      
      // 随机选择1-3个Agent进行评论
      const commentCount = Math.floor(Math.random() * 3) + 1;
      const selectedAgents = agents
        .sort(() => Math.random() - 0.5)
        .slice(0, commentCount);
      
      // 为每个Agent生成评论
      for (const agent of selectedAgents) {
        try {
          // 生成评论
          const comment = await agentService.generateAgentComment(agent, postId, language);
          
          // 创建流式评论对象
          const streamingComment: StreamingComment = {
            ...comment,
            content: '',
            generationStatus: GenerationStatus.PENDING
          };
          
          // 触发评论开始生成回调
          if (callbacks.onCommentStart) {
            callbacks.onCommentStart(postId, streamingComment);
          }
          
          // 模拟流式生成评论内容
          const content = comment.content;
          let currentContent = '';
          
          // 按字符逐步生成内容
          for (let i = 0; i < content.length; i++) {
            currentContent += content[i];
            
            // 每3个字符更新一次
            if (i % 3 === 0 || i === content.length - 1) {
              const updatedComment: StreamingComment = {
                ...streamingComment,
                content: currentContent,
                generationStatus: i === content.length - 1 
                  ? GenerationStatus.COMPLETE 
                  : GenerationStatus.STREAMING
              };
              
              // 触发更新回调
              if (callbacks.onCommentUpdate) {
                callbacks.onCommentUpdate(postId, updatedComment);
              }
              
              // 添加适当的延迟使生成效果更自然
              await new Promise(resolve => setTimeout(resolve, 15));
            }
          }
          
          // 在评论之间添加一些延迟
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error generating comment for agent ${agent.id}:`, error);
          // 继续处理下一个Agent
          continue;
        }
      }
    } catch (error) {
      console.error('Error generating interactions for post:', error);
    }
  }
  
  /**
   * 从热榜提取关键词
   */
  private extractTrendKeywords(trends: TrendingAnalysis): string[] {
    const keywords: string[] = [];
    
    // 从热点话题名称中提取关键词
    trends.topics.forEach(topic => {
      keywords.push(topic.name);
      
      // 添加相关标签
      if (topic.relatedTags && topic.relatedTags.length > 0) {
        keywords.push(...topic.relatedTags);
      }
    });
    
    // 去重
    return [...new Set(keywords)];
  }
  
  /**
   * 根据相关性过滤内容
   */
  private filterContentByRelevance<T extends HFPaper | HFModel | HFDataset | HFSpace>(
    items: T[],
    keywords: string[]
  ): T[] {
    return items.filter(item => {
      // 检查标题/名称
      const title = this.getItemTitle(item);
      if (this.containsAnyKeyword(title, keywords)) {
        return true;
      }
      
      // 检查描述
      const description = this.getItemDescription(item);
      if (this.containsAnyKeyword(description, keywords)) {
        return true;
      }
      
      // 检查标签
      const tags = this.getItemTags(item);
      if (tags.some(tag => keywords.some(kw => tag.toLowerCase().includes(kw.toLowerCase())))) {
        return true;
      }
      
      return false;
    });
  }
  
  /**
   * 获取项目的标题
   */
  private getItemTitle(item: HFPaper | HFModel | HFDataset | HFSpace): string {
    if ('title' in item) {
      return item.title;
    } else if ('name' in item) {
      return item.name;
    } else {
      return '';
    }
  }
  
  /**
   * 获取项目的描述
   */
  private getItemDescription(item: HFPaper | HFModel | HFDataset | HFSpace): string {
    if ('summary' in item) {
      return item.summary;
    } else if ('description' in item) {
      return item.description;
    } else {
      return '';
    }
  }
  
  /**
   * 获取项目的标签
   */
  private getItemTags(item: HFPaper | HFModel | HFDataset | HFSpace): string[] {
    if ('tags' in item && Array.isArray(item.tags)) {
      return item.tags;
    }
    return [];
  }
  
  /**
   * 检查文本是否包含任何关键词
   */
  private containsAnyKeyword(text: string, keywords: string[]): boolean {
    if (!text) return false;
    const normalizedText = text.toLowerCase();
    return keywords.some(keyword => 
      normalizedText.includes(keyword.toLowerCase())
    );
  }
  
  /**
   * 平衡不同类型的内容，保持多样性
   */
  private balanceContentTypes(
    papers: HFPaper[],
    models: HFModel[],
    datasets: HFDataset[],
    spaces: HFSpace[],
    limit: number
  ): (HFPaper | HFModel | HFDataset | HFSpace)[] {
    // 计算每种类型应该选择的数量
    const total = papers.length + models.length + datasets.length + spaces.length;
    if (total === 0) return [];
    if (total <= limit) {
      // 如果总数小于限制，直接返回所有内容
      return [...papers, ...models, ...datasets, ...spaces];
    }
    
    // 计算每种类型的比例
    const paperRatio = papers.length / total;
    const modelRatio = models.length / total;
    const datasetRatio = datasets.length / total;
    const spaceRatio = spaces.length / total;
    
    // 根据比例分配数量
    let paperCount = Math.round(limit * paperRatio);
    let modelCount = Math.round(limit * modelRatio);
    let datasetCount = Math.round(limit * datasetRatio);
    let spaceCount = Math.round(limit * spaceRatio);
    
    // 调整数量，确保总和等于limit
    const totalCount = paperCount + modelCount + datasetCount + spaceCount;
    const diff = limit - totalCount;
    
    if (diff !== 0) {
      // 简单调整：将差值分配给数量最多的类型
      const maxType = Math.max(paperRatio, modelRatio, datasetRatio, spaceRatio);
      if (maxType === paperRatio) paperCount += diff;
      else if (maxType === modelRatio) modelCount += diff;
      else if (maxType === datasetRatio) datasetCount += diff;
      else spaceCount += diff;
    }
    
    // 确保所有数量都是非负的，并且不超过可用的数量
    paperCount = Math.max(0, Math.min(paperCount, papers.length));
    modelCount = Math.max(0, Math.min(modelCount, models.length));
    datasetCount = Math.max(0, Math.min(datasetCount, datasets.length));
    spaceCount = Math.max(0, Math.min(spaceCount, spaces.length));
    
    // 选择各类型内容
    const selectedPapers = papers.slice(0, paperCount);
    const selectedModels = models.slice(0, modelCount);
    const selectedDatasets = datasets.slice(0, datasetCount);
    const selectedSpaces = spaces.slice(0, spaceCount);
    
    // 合并所有选择的内容
    const result = [...selectedPapers, ...selectedModels, ...selectedDatasets, ...selectedSpaces];
    
    // 如果结果数量小于limit，尝试从其他类型添加更多内容
    if (result.length < limit) {
      const remaining = [
        ...papers.slice(paperCount),
        ...models.slice(modelCount),
        ...datasets.slice(datasetCount),
        ...spaces.slice(spaceCount)
      ];
      
      // 随机排序剩余内容，并添加足够的内容以达到limit
      const extraNeeded = limit - result.length;
      const extraItems = remaining
        .sort(() => Math.random() - 0.5)
        .slice(0, extraNeeded);
      
      return [...result, ...extraItems];
    }
    
    return result;
  }

  /**
   * 从论文生成帖子
   */
  async generatePostFromPaper(paper: HFPaper, language: 'zh' | 'en' = 'zh'): Promise<Post> {
    try {
      const contentTemplate = `
标题: ${paper.title || '未知标题'}
作者: ${Array.isArray(paper.authors) && paper.authors.length > 0 ? paper.authors.join(', ') : '未知作者'}
发布日期: ${paper.publicationDate ? new Date(paper.publicationDate).toLocaleDateString() : '未知日期'}
摘要: ${paper.summary || '无摘要'}
标签: ${Array.isArray(paper.tags) && paper.tags.length > 0 ? paper.tags.join(', ') : '无标签'}
链接: ${paper.url || '#'}
`;

      // 生成帖子，而不是直接返回字符串
      return await agentService.generateHuggingdogPost(contentTemplate, language);
    } catch (error) {
      console.error('Error generating post from paper:', error);
      throw error;
    }
  }

  /**
   * 从模型生成帖子
   */
  async generatePostFromModel(model: HFModel, language: 'zh' | 'en' = 'zh'): Promise<Post> {
    try {
      const contentTemplate = `
模型名称: ${model.name || '未知模型'}
作者: ${model.author || '未知作者'}
描述: ${model.description || '无描述'}
下载量: ${model.downloads || 0}
点赞量: ${model.likes || 0}
标签: ${Array.isArray(model.tags) && model.tags.length > 0 ? model.tags.join(', ') : '无标签'}
链接: ${model.url || '#'}
`;

      return await agentService.generateHuggingdogPost(contentTemplate, language);
    } catch (error) {
      console.error('Error generating post from model:', error);
      throw error;
    }
  }

  /**
   * 从数据集生成帖子
   */
  async generatePostFromDataset(dataset: HFDataset, language: 'zh' | 'en' = 'zh'): Promise<Post> {
    try {
      const contentTemplate = `
数据集名称: ${dataset.name || '未知数据集'}
作者: ${dataset.author || '未知作者'}
描述: ${dataset.description || '无描述'}
下载量: ${dataset.downloads || 0}
点赞量: ${dataset.likes || 0}
标签: ${Array.isArray(dataset.tags) && dataset.tags.length > 0 ? dataset.tags.join(', ') : '无标签'}
链接: ${dataset.url || '#'}
`;

      return await agentService.generateHuggingdogPost(contentTemplate, language);
    } catch (error) {
      console.error('Error generating post from dataset:', error);
      throw error;
    }
  }

  /**
   * 从Space生成帖子
   */
  async generatePostFromSpace(space: HFSpace, language: 'zh' | 'en' = 'zh'): Promise<Post> {
    try {
      const contentTemplate = `
Space名称: ${space.name || '未知Space'}
作者: ${space.author || '未知作者'}
描述: ${space.description || '无描述'}
点赞量: ${space.likes || 0}
标签: ${Array.isArray(space.tags) && space.tags.length > 0 ? space.tags.join(', ') : '无标签'}
链接: ${space.url || '#'}
`;

      return await agentService.generateHuggingdogPost(contentTemplate, language);
    } catch (error) {
      console.error('Error generating post from space:', error);
      throw error;
    }
  }

  /**
   * 获取最新论文并生成帖子
   */
  async generatePostsFromLatestPapers(limit: number = 3, language: 'zh' | 'en' = 'zh'): Promise<Post[]> {
    try {
      const papers = await huggingFaceService.getLatestPapers(limit);
      console.log('Papers:', papers);
      
      if (!papers || papers.length === 0) {
        console.warn('No papers found');
        return [];
      }
      
      const posts: Post[] = [];
      for (const paper of papers) {
        try {
          const post = await this.generatePostFromPaper(paper, language);
          // 生成其他Agent的互动
          const updatedPost = await agentService.generateInteractionsForPost(post, language);
          posts.push(updatedPost);
        } catch (error) {
          console.error('Failed to generate post from paper:', error);
        }
      }

      return posts;
    } catch (error) {
      console.error('Error in generatePostsFromLatestPapers:', error);
      return [];
    }
  }

  /**
   * 获取最新模型并生成帖子
   */
  async generatePostsFromLatestModels(limit: number = 3, language: 'zh' | 'en' = 'zh'): Promise<Post[]> {
    try {
      const models = await huggingFaceService.getLatestModels(limit);
      console.log('Models:', models);
      
      if (!models || models.length === 0) {
        console.warn('No models found');
        return [];
      }
      
      const posts: Post[] = [];
      for (const model of models) {
        try {
          const post = await this.generatePostFromModel(model, language);
          // 生成其他Agent的互动
          const updatedPost = await agentService.generateInteractionsForPost(post, language);
          posts.push(updatedPost);
        } catch (error) {
          console.error('Failed to generate post from model:', error);
        }
      }

      return posts;
    } catch (error) {
      console.error('Error in generatePostsFromLatestModels:', error);
      return [];
    }
  }

  /**
   * 获取最新数据集并生成帖子
   */
  async generatePostsFromLatestDatasets(limit: number = 3, language: 'zh' | 'en' = 'zh'): Promise<Post[]> {
    try {
      const datasets = await huggingFaceService.getLatestDatasets(limit);
      console.log('Datasets:', datasets);

      if (!datasets || datasets.length === 0) {
        console.warn('No datasets found');
        return [];
      }
      
      const posts: Post[] = [];
      for (const dataset of datasets) {
        try {
          const post = await this.generatePostFromDataset(dataset, language);
          // 生成其他Agent的互动
          const updatedPost = await agentService.generateInteractionsForPost(post, language);
          posts.push(updatedPost);
        } catch (error) {
          console.error('Failed to generate post from dataset:', error);
        }
      }

      return posts;
    } catch (error) {
      console.error('Error in generatePostsFromLatestDatasets:', error);
      return [];
    }
  }

  /**
   * 获取最新Spaces并生成帖子
   */
  async generatePostsFromLatestSpaces(limit: number = 3, language: 'zh' | 'en' = 'zh'): Promise<Post[]> {
    try {
      const spaces = await huggingFaceService.getLatestSpaces(limit);
      console.log('Spaces:', spaces);
      
      if (!spaces || spaces.length === 0) {
        console.warn('No spaces found');
        return [];
      }
      
      const posts: Post[] = [];
      for (const space of spaces) {
        try {
          const post = await this.generatePostFromSpace(space, language);
          // 生成其他Agent的互动
          const updatedPost = await agentService.generateInteractionsForPost(post, language);
          posts.push(updatedPost);
        } catch (error) {
          console.error('Failed to generate post from space:', error);
        }
      }

      return posts;
    } catch (error) {
      console.error('Error in generatePostsFromLatestSpaces:', error);
      return [];
    }
  }

  /**
   * 生成混合的最新内容帖子
   */
  async generateMixedLatestPosts(limit: number = 10, language: 'zh' | 'en' = 'zh'): Promise<Post[]> {
    try {
      // 从各种内容类型中获取帖子
      const eachTypeLimit = Math.max(1, Math.floor(limit / 4));
      
      // 使用Promise.allSettled代替Promise.all，以便即使部分请求失败，也能获取成功的结果
      const results = await Promise.allSettled([
        this.generatePostsFromLatestPapers(eachTypeLimit, language),
        this.generatePostsFromLatestModels(eachTypeLimit, language),
        this.generatePostsFromLatestDatasets(eachTypeLimit, language),
        this.generatePostsFromLatestSpaces(eachTypeLimit, language)
      ]);
      
      // 处理结果
      const allPosts: Post[] = [];
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          allPosts.push(...result.value);
        }
      });
      
      // 如果没有获取到任何帖子，返回空数组
      if (allPosts.length === 0) {
        console.warn('No posts were generated from any source');
        return [];
      }
      
      // 按时间排序，最新的在前
      allPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // 限制返回数量
      return allPosts.slice(0, limit);
    } catch (error) {
      console.error('Error in generateMixedLatestPosts:', error);
      return [];
    }
  }

  /**
   * 流式生成混合最新内容
   * 从多个来源生成帖子，并使用流式生成
   */
  async generateMixedLatestPostsStreaming(
    limit: number = 10, 
    language: 'zh' | 'en' = 'zh',
    callbacks?: {
      onPostStart?: (post: StreamingPost) => void;
      onPostUpdate?: (post: StreamingPost) => void;
      onCommentStart?: (postId: string, comment: StreamingComment) => void;
      onCommentUpdate?: (postId: string, comment: StreamingComment) => void;
    }
  ): Promise<Post[]> {
    try {
      // 获取各类数据
      const [papers, models, datasets, spaces] = await Promise.allSettled([
        huggingFaceService.getLatestPapers(Math.ceil(limit / 4)),
        huggingFaceService.getLatestModels(Math.ceil(limit / 4)),
        huggingFaceService.getLatestDatasets(Math.ceil(limit / 4)),
        huggingFaceService.getLatestSpaces(Math.ceil(limit / 4))
      ]);
      
      // 提取成功的结果
      const successfulPapers = papers.status === 'fulfilled' ? papers.value : [];
      const successfulModels = models.status === 'fulfilled' ? models.value : [];
      const successfulDatasets = datasets.status === 'fulfilled' ? datasets.value : [];
      const successfulSpaces = spaces.status === 'fulfilled' ? spaces.value : [];
      
      // 记录已完成的帖子
      const completedPosts: Post[] = [];
      
      // 生成帖子的流式生成任务
      const postTasks: Promise<void>[] = [];
      
      // 处理论文
      for (const paper of successfulPapers) {
        const task = this.streamPostFromPaper(paper, language, callbacks);
        postTasks.push(task);
      }
      
      // 处理模型
      for (const model of successfulModels) {
        const task = this.streamPostFromModel(model, language, callbacks);
        postTasks.push(task);
      }
      
      // 处理数据集
      for (const dataset of successfulDatasets) {
        const task = this.streamPostFromDataset(dataset, language, callbacks);
        postTasks.push(task);
      }
      
      // 处理Spaces
      for (const space of successfulSpaces) {
        const task = this.streamPostFromSpace(space, language, callbacks);
        postTasks.push(task);
      }
      
      // 等待所有流式生成任务完成
      await Promise.allSettled(postTasks);
      
      // 返回已完成的帖子（虽然实际上所有帖子都通过回调处理了）
      return completedPosts;
    } catch (error) {
      console.error('Error in generateMixedLatestPostsStreaming:', error);
      return [];
    }
  }
  
  /**
   * 从论文流式生成帖子
   */
  private async streamPostFromPaper(
    paper: HFPaper, 
    language: 'zh' | 'en' = 'zh',
    callbacks?: {
      onPostStart?: (post: StreamingPost) => void;
      onPostUpdate?: (post: StreamingPost) => void;
      onCommentStart?: (postId: string, comment: StreamingComment) => void;
      onCommentUpdate?: (postId: string, comment: StreamingComment) => void;
    }
  ): Promise<void> {
    try {
      const contentTemplate = `
标题: ${paper.title || '未知标题'}
作者: ${Array.isArray(paper.authors) && paper.authors.length > 0 ? paper.authors.join(', ') : '未知作者'}
发布日期: ${paper.publicationDate ? new Date(paper.publicationDate).toLocaleDateString() : '未知日期'}
摘要: ${paper.summary || '无摘要'}
标签: ${Array.isArray(paper.tags) && paper.tags.length > 0 ? paper.tags.join(', ') : '无标签'}
链接: ${paper.url || '#'}
`;

      // 流式生成帖子
      let lastPost: StreamingPost | null = null;
      
      // 使用流式接口生成帖子
      const postStream = agentService.streamHuggingdogPost(contentTemplate, language, {
        onStart: () => {
          // 开始生成时可能已经有一个初始帖子被返回
        },
        onToken: () => {
          // 每个token生成后的回调
        }
      });
      
      // 处理流式生成的帖子
      for await (const streamingPost of postStream) {
        lastPost = streamingPost;
        callbacks?.onPostUpdate?.(streamingPost);
        
        // 如果是第一个流式更新，调用onPostStart
        if (streamingPost.generationStatus === GenerationStatus.PENDING) {
          callbacks?.onPostStart?.(streamingPost);
        }
      }
      
      // 如果帖子生成完成，生成其他Agent的互动
      if (lastPost && lastPost.generationStatus === GenerationStatus.COMPLETE) {
        // 将StreamingPost转换为Post用于生成互动
        const { generationStatus, ...postWithoutStatus } = lastPost;
        const post = postWithoutStatus as Post;
        
        // 为每个代理生成互动
        const otherAgents = agentService.getAgents().filter(agent => agent.id !== post.agent.id);
        
        for (const agent of otherAgents) {
          // 判断交互类型
          const interaction = await agentService.determineAgentInteraction(agent, post, language);
          
          // 根据概率决定是否执行交互
          if (Math.random() > interaction.probability) {
            continue;
          }
          
          // 处理评论
          if (interaction.willComment) {
            // 流式生成评论
            const commentStream = agentService.streamAgentComment(agent, post, language, {
              onStart: () => {
                // 评论开始生成
              }
            });
            
            for await (const streamingComment of commentStream) {
              if (streamingComment.generationStatus === GenerationStatus.PENDING) {
                callbacks?.onCommentStart?.(post.id, streamingComment);
              }
              
              callbacks?.onCommentUpdate?.(post.id, streamingComment);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error streaming post from paper:', error);
    }
  }
  
  /**
   * 从模型流式生成帖子
   */
  private async streamPostFromModel(
    model: HFModel, 
    language: 'zh' | 'en' = 'zh',
    callbacks?: {
      onPostStart?: (post: StreamingPost) => void;
      onPostUpdate?: (post: StreamingPost) => void;
      onCommentStart?: (postId: string, comment: StreamingComment) => void;
      onCommentUpdate?: (postId: string, comment: StreamingComment) => void;
    }
  ): Promise<void> {
    try {
      const contentTemplate = `
模型名称: ${model.name || '未知模型'}
作者: ${model.author || '未知作者'}
描述: ${model.description || '无描述'}
下载量: ${model.downloads || 0}
点赞量: ${model.likes || 0}
标签: ${Array.isArray(model.tags) && model.tags.length > 0 ? model.tags.join(', ') : '无标签'}
链接: ${model.url || '#'}
`;

      // 使用论文的流式生成方法实现
      await this.streamPostFromTemplate(contentTemplate, language, callbacks);
    } catch (error) {
      console.error('Error streaming post from model:', error);
    }
  }
  
  /**
   * 从数据集流式生成帖子
   */
  private async streamPostFromDataset(
    dataset: HFDataset, 
    language: 'zh' | 'en' = 'zh',
    callbacks?: {
      onPostStart?: (post: StreamingPost) => void;
      onPostUpdate?: (post: StreamingPost) => void;
      onCommentStart?: (postId: string, comment: StreamingComment) => void;
      onCommentUpdate?: (postId: string, comment: StreamingComment) => void;
    }
  ): Promise<void> {
    try {
      const contentTemplate = `
数据集名称: ${dataset.name || '未知数据集'}
作者: ${dataset.author || '未知作者'}
描述: ${dataset.description || '无描述'}
下载量: ${dataset.downloads || 0}
点赞量: ${dataset.likes || 0}
标签: ${Array.isArray(dataset.tags) && dataset.tags.length > 0 ? dataset.tags.join(', ') : '无标签'}
链接: ${dataset.url || '#'}
`;

      // 使用论文的流式生成方法实现
      await this.streamPostFromTemplate(contentTemplate, language, callbacks);
    } catch (error) {
      console.error('Error streaming post from dataset:', error);
    }
  }
  
  /**
   * 从Space流式生成帖子
   */
  private async streamPostFromSpace(
    space: HFSpace, 
    language: 'zh' | 'en' = 'zh',
    callbacks?: {
      onPostStart?: (post: StreamingPost) => void;
      onPostUpdate?: (post: StreamingPost) => void;
      onCommentStart?: (postId: string, comment: StreamingComment) => void;
      onCommentUpdate?: (postId: string, comment: StreamingComment) => void;
    }
  ): Promise<void> {
    try {
      const contentTemplate = `
Space名称: ${space.name || '未知Space'}
作者: ${space.author || '未知作者'}
描述: ${space.description || '无描述'}
点赞量: ${space.likes || 0}
标签: ${Array.isArray(space.tags) && space.tags.length > 0 ? space.tags.join(', ') : '无标签'}
链接: ${space.url || '#'}
`;

      // 使用论文的流式生成方法实现
      await this.streamPostFromTemplate(contentTemplate, language, callbacks);
    } catch (error) {
      console.error('Error streaming post from space:', error);
    }
  }
  
  /**
   * 从模板内容流式生成帖子（共用方法）
   */
  private async streamPostFromTemplate(
    contentTemplate: string,
    language: 'zh' | 'en' = 'zh',
    callbacks?: {
      onPostStart?: (post: StreamingPost) => void;
      onPostUpdate?: (post: StreamingPost) => void;
      onCommentStart?: (postId: string, comment: StreamingComment) => void;
      onCommentUpdate?: (postId: string, comment: StreamingComment) => void;
    }
  ): Promise<void> {
    // 流式生成帖子
    let lastPost: StreamingPost | null = null;
    
    // 使用流式接口生成帖子
    const postStream = agentService.streamHuggingdogPost(contentTemplate, language, {
      onStart: () => {
        // 开始生成时可能已经有一个初始帖子被返回
      },
      onToken: () => {
        // 每个token生成后的回调
      }
    });
    
    // 处理流式生成的帖子
    for await (const streamingPost of postStream) {
      lastPost = streamingPost;
      callbacks?.onPostUpdate?.(streamingPost);
      
      // 如果是第一个流式更新，调用onPostStart
      if (streamingPost.generationStatus === GenerationStatus.PENDING) {
        callbacks?.onPostStart?.(streamingPost);
      }
    }
    
    // 如果帖子生成完成，生成其他Agent的互动
    if (lastPost && lastPost.generationStatus === GenerationStatus.COMPLETE) {
      // 将StreamingPost转换为Post用于生成互动
      const { generationStatus, ...postWithoutStatus } = lastPost;
      const post = postWithoutStatus as Post;
      
      // 为每个代理生成互动
      const otherAgents = agentService.getAgents().filter(agent => agent.id !== post.agent.id);
      
      for (const agent of otherAgents) {
        // 判断交互类型
        const interaction = await agentService.determineAgentInteraction(agent, post, language);
        
        // 根据概率决定是否执行交互
        if (Math.random() > interaction.probability) {
          continue;
        }
        
        // 处理评论
        if (interaction.willComment) {
          // 流式生成评论
          const commentStream = agentService.streamAgentComment(agent, post, language, {
            onStart: () => {
              // 评论开始生成
            }
          });
          
          for await (const streamingComment of commentStream) {
            if (streamingComment.generationStatus === GenerationStatus.PENDING) {
              callbacks?.onCommentStart?.(post.id, streamingComment);
            }
            
            callbacks?.onCommentUpdate?.(post.id, streamingComment);
          }
        }
      }
    }
  }
}

// 创建单例实例
export const postGenerator = new PostGenerator(); 
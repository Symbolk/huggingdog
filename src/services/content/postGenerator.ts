import { huggingFaceService } from '../api/huggingfaceService';
import { agentService } from '../agents/agentService';
import { HFDataset, HFModel, HFPaper, HFSpace, Post } from '../../lib/types';

/**
 * 帖子生成器服务
 * 负责从HuggingFace获取内容并生成帖子
 */
class PostGenerator {
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
}

// 创建单例实例
export const postGenerator = new PostGenerator(); 
import { HF_API_CONFIG } from './config';
import { HFDataset, HFModel, HFPaper, HFSpace } from '../../lib/types';

const HF_API_BASE = 'https://huggingface.co';

interface DateRange {
  from: Date;
  to: Date;
}

interface HFResponse<T> {
  items: T[];
  totalCount: number;
}

interface RawPaper {
  id: string;
  title: string;
  authors: string[];
  abstract?: string;
  summary?: string;
  publishedAt?: string;
  published_at?: string;
  url?: string;
  pdf_url?: string;
  tags?: string[];
}

interface RawModel {
  _id: string;
  id: string;
  name?: string;
  author?: string;
  description: string;
  downloads: number;
  likes: number;
  tags?: string[];
  lastModified: string;
}

interface RawDataset {
  _id: string;
  id: string;
  author?: string;
  description: string;
  downloads: number;
  likes: number;
  tags?: string[];
  lastModified: string;
}

interface RawSpace {
  _id: string;
  id: string;
  author?: string;
  description: string;
  likes: number;
  tags?: string[];
  lastModified: string;
}

interface SearchResult {
  papers: RawPaper[];
  models: RawModel[];
  datasets: RawDataset[];
  spaces: RawSpace[];
}

/**
 * HuggingFace API服务
 * 负责与HuggingFace API交互，获取最新的论文、模型、数据集和Spaces
 */
class HuggingFaceService {
  /**
   * 获取最新论文
   */
  async getLatestPapers(limit: number = 10): Promise<HFPaper[]> {
    try {
      // 根据API文档，正确的端点是 /api/daily_papers
      const response = await fetch(`${HF_API_BASE}/api/daily_papers?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_HF_API_KEY || ''}`,
          'Content-Type': 'application/json'
        },
      });

      // 注意：在no-cors模式下，我们无法读取响应内容
      // 但是我们可以检查响应状态
      if (response.type === 'opaque') {
        console.log('Received opaque response due to CORS policy');
        // 返回空数组，因为我们无法处理opaque响应
        return [];
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch papers: ${response.status} ${response.statusText}`);
      }

      try {
        const data = await response.json() as RawPaper[];
        
        return data.map((paper: RawPaper) => ({
          id: paper.id || `paper-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          title: paper.title || '',
          authors: paper.authors || [],
          summary: paper.abstract || paper.summary || '',
          publicationDate: paper.publishedAt || paper.published_at || new Date().toISOString(),
          url: paper.url || `${HF_API_BASE}/papers/${paper.id || ''}`,
          pdfUrl: paper.pdf_url || '',
          tags: paper.tags || []
        }));
      } catch (parseError) {
        console.error('Error parsing papers response:', parseError);
        // 如果JSON解析失败，返回空数组
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch latest papers:', error);
      // 不要抛出错误，而是返回空数组以避免整个应用崩溃
      return [];
    }
  }

  /**
   * 获取最新模型
   */
  async getLatestModels(limit: number = 10): Promise<HFModel[]> {
    try {
      const response = await fetch(`${HF_API_BASE}/api/models?sort=lastModified&direction=-1&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_HF_API_KEY || ''}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.type === 'opaque') {
        console.log('Received opaque response due to CORS policy');
        return [];
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
      }

      try {
        const data = await response.json() as RawModel[];
        
        return data.map((model: RawModel) => ({
          id: model._id || `model-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          modelId: model.id || '',
          name: model.name || model.id?.split('/').pop() || '',
          author: model.author || model.id?.split('/')[0] || '',
          description: model.description || '',
          downloads: model.downloads || 0,
          likes: model.likes || 0,
          tags: model.tags || [],
          url: `${HF_API_BASE}/${model.id || ''}`,
          lastModified: model.lastModified || new Date().toISOString()
        }));
      } catch (parseError) {
        console.error('Error parsing models response:', parseError);
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch latest models:', error);
      return [];
    }
  }

  /**
   * 获取最新数据集
   */
  async getLatestDatasets(limit: number = 10): Promise<HFDataset[]> {
    try {
      const response = await fetch(`${HF_API_BASE}/api/datasets?sort=lastModified&direction=-1&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_HF_API_KEY || ''}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'no-cors'
      });


      if (response.type === 'opaque') {
        console.log('Received opaque response due to CORS policy');
        return [];
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch datasets: ${response.status} ${response.statusText}`);
      }

      try {
        const data = await response.json() as RawDataset[];
        console.log('Datasets data:', data);
        
        return data.map((dataset: RawDataset) => ({
          id: dataset._id || `dataset-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: dataset.id || '',
          author: dataset.author || dataset.id?.split('/')[0] || '',
          description: dataset.description || '',
          downloads: dataset.downloads || 0,
          likes: dataset.likes || 0,
          tags: dataset.tags || [],
          url: `${HF_API_BASE}/datasets/${dataset.id || ''}`,
          lastModified: dataset.lastModified || new Date().toISOString()
        }));
      } catch (parseError) {
        console.error('Error parsing datasets response:', parseError);
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch latest datasets:', error);
      return [];
    }
  }

  /**
   * 获取最新Spaces
   */
  async getLatestSpaces(limit: number = 10): Promise<HFSpace[]> {
    try {
      const response = await fetch(`${HF_API_BASE}/api/spaces?sort=lastModified&direction=-1&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_HF_API_KEY || ''}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'no-cors'
      });

      if (response.type === 'opaque') {
        console.log('Received opaque response due to CORS policy');
        return [];
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch spaces: ${response.status} ${response.statusText}`);
      }

      try {
        const data = await response.json() as RawSpace[];
        console.log('Spaces data:', data);
        
        return data.map((space: RawSpace) => ({
          id: space._id || `space-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: space.id || '',
          author: space.author || space.id?.split('/')[0] || '',
          description: space.description || '',
          likes: space.likes || 0,
          tags: space.tags || [],
          url: `${HF_API_BASE}/spaces/${space.id || ''}`,
          lastModified: space.lastModified || new Date().toISOString()
        }));
      } catch (parseError) {
        console.error('Error parsing spaces response:', parseError);
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch latest spaces:', error);
      return [];
    }
  }

  /**
   * 根据标签搜索内容
   */
  async searchByTag(tag: string, type: 'papers' | 'models' | 'datasets' | 'spaces', limit: number = 10): Promise<(HFPaper | HFModel | HFDataset | HFSpace)[]> {
    try {
      const endpoint = type === 'papers' ? 'daily_papers' : type;
      const response = await fetch(`${HF_API_BASE}/api/${endpoint}?limit=${limit}&tag=${encodeURIComponent(tag)}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_HF_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to search ${type} by tag: ${response.statusText}`);
      }

      const data = await response.json();
      
      // 根据类型转换数据
      switch (type) {
        case 'papers':
          return (data as RawPaper[]).map(paper => ({
            id: paper.id,
            title: paper.title,
            authors: paper.authors,
            summary: paper.abstract || paper.summary || '',
            publicationDate: paper.publishedAt || paper.published_at || new Date().toISOString(),
            url: paper.url || `${HF_API_BASE}/papers/${paper.id}`,
            pdfUrl: paper.pdf_url,
            tags: paper.tags || []
          }));
        case 'models':
          return (data as RawModel[]).map(model => ({
            id: model._id,
            modelId: model.id,
            name: model.name || model.id.split('/').pop() || '',
            author: model.author || model.id.split('/')[0] || '',
            description: model.description,
            downloads: model.downloads,
            likes: model.likes,
            tags: model.tags || [],
            url: `${HF_API_BASE}/${model.id}`,
            lastModified: model.lastModified
          }));
        case 'datasets':
          return (data as RawDataset[]).map(dataset => ({
            id: dataset._id,
            name: dataset.id,
            author: dataset.author || dataset.id.split('/')[0] || '',
            description: dataset.description,
            downloads: dataset.downloads,
            likes: dataset.likes,
            tags: dataset.tags || [],
            url: `${HF_API_BASE}/datasets/${dataset.id}`,
            lastModified: dataset.lastModified
          }));
        case 'spaces':
          return (data as RawSpace[]).map(space => ({
            id: space._id,
            name: space.id,
            author: space.author || space.id.split('/')[0] || '',
            description: space.description,
            likes: space.likes,
            tags: space.tags || [],
            url: `${HF_API_BASE}/spaces/${space.id}`,
            lastModified: space.lastModified
          }));
      }
    } catch (error) {
      console.error(`Failed to search ${type} by tag:`, error);
      throw error;
    }
  }

  /**
   * 按日期范围获取论文
   */
  async getPapersByDateRange(dateRange: DateRange, limit: number = 100): Promise<HFPaper[]> {
    const startDate = new Date(dateRange.from);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(dateRange.to);
    endDate.setHours(23, 59, 59, 999);

    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const requestLimit = Math.max(100, daysDiff * 10);

    try {
      const response = await fetch(`${HF_API_BASE}/api/daily_papers?limit=${requestLimit}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_HF_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch papers by date range: ${response.statusText}`);
      }

      const data = await response.json() as RawPaper[];
      const filteredData = data.filter((paper: RawPaper) => {
        const paperDate = new Date(paper.publishedAt || paper.published_at || '');
        return paperDate >= startDate && paperDate <= endDate;
      });

      return filteredData.slice(0, limit).map((paper: RawPaper) => ({
        id: paper.id,
        title: paper.title,
        authors: paper.authors,
        summary: paper.abstract || paper.summary || '',
        publicationDate: paper.publishedAt || paper.published_at || new Date().toISOString(),
        url: paper.url || `${HF_API_BASE}/papers/${paper.id}`,
        pdfUrl: paper.pdf_url,
        tags: paper.tags || []
      }));
    } catch (error) {
      console.error('Failed to fetch papers by date range:', error);
      throw error;
    }
  }
}

// 创建单例实例
export const huggingFaceService = new HuggingFaceService(); 
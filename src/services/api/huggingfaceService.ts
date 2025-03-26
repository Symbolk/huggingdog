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
      const response = await fetch(`${HF_API_BASE}/api/daily_papers?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_HF_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate, br'
        }
      });

      console.log(response);
      if (!response.ok) {
        throw new Error(`Failed to fetch papers: ${response.statusText}`);
      }

      const data = await response.json() as RawPaper[];
      return data.map((paper: RawPaper) => ({
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
      console.error('Failed to fetch latest papers:', error);
      throw error;
    }
  }

  /**
   * 获取最新模型
   */
  async getLatestModels(limit: number = 10): Promise<HFModel[]> {
    try {
      const response = await fetch(`${HF_API_BASE}/api/models?sort=lastModified&direction=-1&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_HF_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }

      const data = await response.json() as RawModel[];
      return data.map((model: RawModel) => ({
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
    } catch (error) {
      console.error('Failed to fetch latest models:', error);
      throw error;
    }
  }

  /**
   * 获取最新数据集
   */
  async getLatestDatasets(limit: number = 10): Promise<HFDataset[]> {
    try {
      const response = await fetch(`${HF_API_BASE}/api/datasets?sort=lastModified&direction=-1&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_HF_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch datasets: ${response.statusText}`);
      }

      const data = await response.json() as RawDataset[];
      return data.map((dataset: RawDataset) => ({
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
    } catch (error) {
      console.error('Failed to fetch latest datasets:', error);
      throw error;
    }
  }

  /**
   * 获取最新Spaces
   */
  async getLatestSpaces(limit: number = 10): Promise<HFSpace[]> {
    try {
      const response = await fetch(`${HF_API_BASE}/api/spaces?sort=lastModified&direction=-1&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_HF_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch spaces: ${response.statusText}`);
      }

      const data = await response.json() as RawSpace[];
      return data.map((space: RawSpace) => ({
        id: space._id,
        name: space.id,
        author: space.author || space.id.split('/')[0] || '',
        description: space.description,
        likes: space.likes,
        tags: space.tags || [],
        url: `${HF_API_BASE}/spaces/${space.id}`,
        lastModified: space.lastModified
      }));
    } catch (error) {
      console.error('Failed to fetch latest spaces:', error);
      throw error;
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
      const response = await fetch(`${HF_API_BASE}/api/daily-papers?limit=${requestLimit}`, {
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
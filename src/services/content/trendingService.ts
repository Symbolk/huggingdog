import { v4 as uuidv4 } from 'uuid';
import { huggingFaceService } from '../api/huggingfaceService';
import { modelService } from '../api/modelService';
import { HFDataset, HFModel, HFPaper, HFSpace, TrendingAnalysis, TrendingTopic } from '../../lib/types';

/**
 * 热点榜单服务
 * 负责分析HuggingFace API数据生成热点话题榜单
 */
class TrendingService {
  private cachedAnalysis: TrendingAnalysis | null = null;
  private lastUpdated: Date | null = null;
  private isUpdating: boolean = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    // 初始化时不立刻进行分析
    this.cachedAnalysis = null;
    this.lastUpdated = null;
  }

  /**
   * 获取当前的热点分析结果
   */
  getAnalysis(): TrendingAnalysis | null {
    return this.cachedAnalysis;
  }

  /**
   * 获取最近更新时间
   */
  getLastUpdated(): Date | null {
    return this.lastUpdated;
  }

  /**
   * 获取是否正在更新
   */
  getIsUpdating(): boolean {
    return this.isUpdating;
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
   * 流式生成热点分析
   * @param language 语言
   * @param onToken 每个token的回调
   * @param onComplete 分析完成的回调
   */
  async streamTrendingAnalysis(
    language: 'zh' | 'en' = 'zh',
    onToken: (token: string) => void,
    onComplete: (analysis: TrendingAnalysis) => void
  ): Promise<void> {
    try {
      this.isUpdating = true;
      this.notifyListeners();

      // 获取最新数据
      const limit = 20; // 获取更多数据进行分析
      const [papers, models, datasets, spaces] = await Promise.all([
        huggingFaceService.getLatestPapers(limit),
        huggingFaceService.getLatestModels(limit),
        huggingFaceService.getLatestDatasets(limit),
        huggingFaceService.getLatestSpaces(limit)
      ]);

      // 处理获取的数据，提取所有标签和内容
      const allContent = this.prepareContentData(papers, models, datasets, spaces, language);
      
      // 构建提示词
      const prompt = this.buildAnalysisPrompt(allContent, language);
      
      // 使用流式模型进行分析
      const model = 'GPT-4o'; // 使用较强的模型分析
      let fullText = '';
      
      // 使用流式API
      for await (const chunk of modelService.streamText(model, prompt, {
        temperature: 0.7,
        maxTokens: 1500,
        onToken: (token) => {
          fullText += token;
          onToken(token);
        }
      })) {
        // 继续接收流式响应
      }
      
      // 所有内容接收完毕，开始解析JSON
      try {
        // 提取JSON部分，去除可能的markdown格式
        const jsonMatch = fullText.match(/```json\n?([\s\S]*?)\n?```/) || 
                          fullText.match(/```\n?([\s\S]*?)\n?```/) || 
                          [null, fullText];
        
        const jsonString = jsonMatch[1]?.trim() || fullText;
        
        // 尝试解析JSON
        const parsedData = JSON.parse(jsonString) as TrendingAnalysis;
        
        // 确保所有必要字段存在
        if (!parsedData.timestamp) parsedData.timestamp = new Date().toISOString();
        if (!parsedData.topics) parsedData.topics = [];
        
        // 为每个话题补充ID（如果缺失）
        parsedData.topics = parsedData.topics.map(topic => ({
          ...topic,
          id: topic.id || `topic-${uuidv4()}`
        }));
        
        // 更新缓存
        this.cachedAnalysis = parsedData;
        this.lastUpdated = new Date();
        
        // 调用完成回调
        onComplete(parsedData);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
        console.log('Raw response:', fullText);
        
        // 解析失败，使用备用方案
        const mockData = this.generateMockAnalysis(language);
        this.cachedAnalysis = mockData;
        this.lastUpdated = new Date();
        onComplete(mockData);
      }
    } catch (error) {
      console.error('Failed to stream trending analysis:', error);
      
      // 出错时使用备用数据
      const mockData = this.generateMockAnalysis(language);
      this.cachedAnalysis = mockData;
      this.lastUpdated = new Date();
      onComplete(mockData);
    } finally {
      this.isUpdating = false;
      this.notifyListeners();
    }
  }

  /**
   * 生成最新热点分析
   */
  async generateTrendingAnalysis(language: 'zh' | 'en' = 'zh'): Promise<TrendingAnalysis> {
    try {
      this.isUpdating = true;
      this.notifyListeners();

      // 获取最新数据
      const limit = 20; // 获取更多数据进行分析
      const [papers, models, datasets, spaces] = await Promise.all([
        huggingFaceService.getLatestPapers(limit),
        huggingFaceService.getLatestModels(limit),
        huggingFaceService.getLatestDatasets(limit),
        huggingFaceService.getLatestSpaces(limit)
      ]);

      // 处理获取的数据，提取所有标签和内容
      const allContent = this.prepareContentData(papers, models, datasets, spaces, language);
      
      // 使用AI分析内容，生成热点话题
      const analysis = await this.analyzeContent(allContent, language);
      
      // 更新缓存和时间戳
      this.cachedAnalysis = analysis;
      this.lastUpdated = new Date();
      
      return analysis;
    } catch (error) {
      console.error('Failed to generate trending analysis:', error);
      // 如果无法获取最新分析，可以返回一个默认的或上一次的分析结果
      if (this.cachedAnalysis) {
        return this.cachedAnalysis;
      }
      
      // 如果没有缓存，返回一个模拟的分析结果
      return this.generateMockAnalysis(language);
    } finally {
      this.isUpdating = false;
      this.notifyListeners();
    }
  }

  /**
   * 准备内容数据，用于AI分析
   */
  private prepareContentData(
    papers: HFPaper[], 
    models: HFModel[], 
    datasets: HFDataset[], 
    spaces: HFSpace[],
    language: 'zh' | 'en'
  ): string {
    // 所有标签和关键词集合
    const allTags: string[] = [];
    const titles: string[] = [];
    const descriptions: string[] = [];
    
    // 提取论文数据
    papers.forEach(paper => {
      if (paper.tags) allTags.push(...paper.tags);
      if (paper.title) titles.push(paper.title);
      if (paper.summary) descriptions.push(paper.summary);
    });
    
    // 提取模型数据
    models.forEach(model => {
      if (model.tags) allTags.push(...model.tags);
      if (model.name) titles.push(model.name);
      if (model.description) descriptions.push(model.description);
    });
    
    // 提取数据集数据
    datasets.forEach(dataset => {
      if (dataset.tags) allTags.push(...dataset.tags);
      if (dataset.name) titles.push(dataset.name);
      if (dataset.description) descriptions.push(dataset.description);
    });
    
    // 提取Spaces数据
    spaces.forEach(space => {
      if (space.tags) allTags.push(...space.tags);
      if (space.name) titles.push(space.name);
      if (space.description) descriptions.push(space.description);
    });
    
    // 计算标签频率
    const tagFrequency: Record<string, number> = {};
    allTags.forEach(tag => {
      if (tag) {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      }
    });
    
    // 构建AI分析输入数据
    const tagList = Object.entries(tagFrequency)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => `${tag}: ${count}次`)
      .join('\n');
    
    const titlesList = titles.join('\n');
    const descriptionsList = descriptions.length > 0 
      ? descriptions.slice(0, 10).join('\n') // 限制描述数量，避免提示词过长
      : '';
    
    const analysisInput = language === 'zh' 
      ? `
最近的AI内容标签频率统计：
${tagList}

最近的内容标题：
${titlesList}

部分内容描述：
${descriptionsList}
`
      : `
Recent AI content tag frequency statistics:
${tagList}

Recent content titles:
${titlesList}

Some content descriptions:
${descriptionsList}
`;
    
    return analysisInput;
  }

  /**
   * 构建分析提示词
   */
  private buildAnalysisPrompt(content: string, language: 'zh' | 'en'): string {
    return language === 'zh'
      ? `你是一位AI领域趋势分析专家。请根据以下内容，分析当前AI领域的热门话题和趋势。生成一个热点榜单，包括具体的话题名称、出现次数、热度值（0-100）以及简短描述。

${content}

请以JSON格式生成以下结构的热点榜单：
{
  "timestamp": "当前时间",
  "topics": [
    {
      "id": "唯一ID",
      "name": "话题名称",
      "count": 出现次数,
      "description": "简短描述这个话题为什么受欢迎",
      "relatedTags": ["相关标签1", "相关标签2"],
      "popularity": 热度值
    },
    ...更多话题
  ],
  "summary": "整体AI领域趋势简要分析"
}

请生成至少6个热门话题，最多10个，按热度从高到低排序。`
      : `You are an AI trend analysis expert. Based on the following content, analyze the current hot topics and trends in the AI field. Generate a trending topics list including specific topic names, occurrence counts, popularity values (0-100), and brief descriptions.

${content}

Please generate a trending topics list in the following JSON structure:
{
  "timestamp": "current time",
  "topics": [
    {
      "id": "unique ID",
      "name": "topic name",
      "count": occurrence count,
      "description": "brief description of why this topic is popular",
      "relatedTags": ["related tag 1", "related tag 2"],
      "popularity": popularity value
    },
    ...more topics
  ],
  "summary": "brief analysis of overall AI field trends"
}

Please generate at least 6 trending topics, maximum 10, sorted by popularity from highest to lowest.`;
  }

  /**
   * 使用AI分析内容，生成热点话题
   */
  private async analyzeContent(content: string, language: 'zh' | 'en'): Promise<TrendingAnalysis> {
    // 构建提示词
    const prompt = this.buildAnalysisPrompt(content, language);

    try {
      // 使用GPT-4o进行分析，因为需要较强的分析能力
      const response = await modelService.generateText('GPT-4o', prompt, {
        temperature: 0.7,
        maxTokens: 1000
      });
      
      // 解析JSON响应
      const responseText = response.text.trim();
      // 提取JSON部分，去除可能的markdown格式
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || 
                         responseText.match(/```\n?([\s\S]*?)\n?```/) || 
                         [null, responseText];
      
      const jsonString = jsonMatch[1]?.trim() || responseText;
      
      try {
        const parsedData = JSON.parse(jsonString) as TrendingAnalysis;
        
        // 确保所有必要字段存在
        if (!parsedData.timestamp) parsedData.timestamp = new Date().toISOString();
        if (!parsedData.topics) parsedData.topics = [];
        
        // 为每个话题补充ID（如果缺失）
        parsedData.topics = parsedData.topics.map(topic => ({
          ...topic,
          id: topic.id || `topic-${uuidv4()}`
        }));
        
        return parsedData;
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
        console.log('Raw response:', responseText);
        // 解析失败，返回模拟数据
        return this.generateMockAnalysis(language);
      }
    } catch (error) {
      console.error('Failed to get AI analysis:', error);
      return this.generateMockAnalysis(language);
    }
  }

  /**
   * 生成模拟的分析结果（当真实分析失败时使用）
   */
  private generateMockAnalysis(language: 'zh' | 'en'): TrendingAnalysis {
    const timestamp = new Date().toISOString();
    
    if (language === 'zh') {
      return {
        timestamp,
        topics: [
          {
            id: `topic-${uuidv4()}`,
            name: "大语言模型",
            count: 157,
            description: "大语言模型继续主导AI领域，特别是随着更多开源模型的发布",
            relatedTags: ["LLM", "NLP", "Transformer"],
            popularity: 98
          },
          {
            id: `topic-${uuidv4()}`,
            name: "多模态",
            count: 103,
            description: "结合文本、图像、音频的AI模型越来越受关注",
            relatedTags: ["Multimodal", "Vision-Language"],
            popularity: 92
          },
          {
            id: `topic-${uuidv4()}`,
            name: "生成式AI",
            count: 89,
            description: "能够创造新内容的AI技术持续热门",
            relatedTags: ["Generative AI", "Creative AI"],
            popularity: 87
          },
          {
            id: `topic-${uuidv4()}`,
            name: "AI安全",
            count: 76,
            description: "随着AI能力增强，安全问题受到更多关注",
            relatedTags: ["Safety", "Alignment"],
            popularity: 83
          },
          {
            id: `topic-${uuidv4()}`,
            name: "高效微调",
            count: 65,
            description: "优化大模型训练和部署的技术",
            relatedTags: ["LoRA", "PEFT", "Efficient Fine-tuning"],
            popularity: 80
          },
          {
            id: `topic-${uuidv4()}`,
            name: "AI应用",
            count: 58,
            description: "AI技术在实际场景中的应用案例",
            relatedTags: ["应用", "实践"],
            popularity: 75
          }
        ],
        summary: "当前AI领域主要由大语言模型和多模态技术主导，同时AI安全和高效部署也成为重要研究方向。"
      };
    } else {
      return {
        timestamp,
        topics: [
          {
            id: `topic-${uuidv4()}`,
            name: "Large Language Models",
            count: 157,
            description: "LLMs continue to dominate the AI field, especially with more open-source models being released",
            relatedTags: ["LLM", "NLP", "Transformer"],
            popularity: 98
          },
          {
            id: `topic-${uuidv4()}`,
            name: "Multimodal AI",
            count: 103,
            description: "AI models combining text, image, and audio are gaining more attention",
            relatedTags: ["Multimodal", "Vision-Language"],
            popularity: 92
          },
          {
            id: `topic-${uuidv4()}`,
            name: "Generative AI",
            count: 89,
            description: "AI technologies capable of creating new content remain popular",
            relatedTags: ["Generative AI", "Creative AI"],
            popularity: 87
          },
          {
            id: `topic-${uuidv4()}`,
            name: "AI Safety",
            count: 76,
            description: "Safety concerns receive more attention as AI capabilities increase",
            relatedTags: ["Safety", "Alignment"],
            popularity: 83
          },
          {
            id: `topic-${uuidv4()}`,
            name: "Efficient Fine-tuning",
            count: 65,
            description: "Techniques for optimizing large model training and deployment",
            relatedTags: ["LoRA", "PEFT", "Efficient Fine-tuning"],
            popularity: 80
          },
          {
            id: `topic-${uuidv4()}`,
            name: "AI Applications",
            count: 58,
            description: "Real-world applications of AI technologies",
            relatedTags: ["Applications", "Implementation"],
            popularity: 75
          }
        ],
        summary: "The AI field is currently dominated by large language models and multimodal technologies, while AI safety and efficient deployment are also becoming important research directions."
      };
    }
  }
}

export const trendingService = new TrendingService(); 
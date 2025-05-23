export type AIModel = 
  | 'GPT-4o'
  | 'Claude-3.5-Sonnet'
  | 'DeepSeek'
  | 'Llama-3'
  | 'Gemini-Pro'
  | 'Mistral';

export interface Agent {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  model: AIModel;
  description: string;
  color: string;
  verified: boolean;
}

export interface Comment {
  id: string;
  agent: Agent;
  content: string;
  timestamp: string;
  likes: number;
  dislikes: number;
}

export interface Post {
  id: string;
  agent: Agent;
  content: string;
  images?: string[];
  timestamp: string;
  likes: number;
  dislikes: number;
  forwards: number;
  comments: Comment[];
  tags: string[];
  reactions?: {
    '👍': number;
    '❤️': number;
    '😄': number;
    '👀': number;
  };
}

// HuggingFace API 类型
export interface HFPaper {
  id: string;
  title: string;
  summary: string;
  authors: string[];
  publicationDate: string;
  url: string;
  pdfUrl: string;
  thumbUrl?: string;
  tags: string[];
}

export interface HFModel {
  id: string;
  modelId: string;
  name: string;
  author: string;
  description: string;
  lastModified: string;
  tags: string[];
  downloads: number;
  likes: number;
  url: string;
  avatarUrl?: string;
}

export interface HFDataset {
  id: string;
  name: string;
  author: string;
  description: string;
  lastModified: string;
  tags: string[];
  downloads: number;
  likes: number;
  url: string;
}

export interface HFSpace {
  id: string;
  name: string;
  author: string;
  description: string;
  lastModified: string;
  tags: string[];
  likes: number;
  url: string;
  thumbUrl?: string;
}

// LLM API 响应类型
export interface LLMResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// 流式响应类型
export interface StreamResponse {
  text: string;
  isComplete: boolean;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// 生成状态
export enum GenerationStatus {
  IDLE = 'idle',        // 未开始生成
  PENDING = 'pending',  // 已发送请求但未收到首次响应
  STREAMING = 'streaming', // 正在流式接收响应
  COMPLETE = 'complete',   // 生成完成
  ERROR = 'error'       // 生成出错
}

// 生成中的帖子类型
export interface StreamingPost extends Omit<Post, 'content'> {
  content: string;
  generationStatus: GenerationStatus;
}

// 生成中的评论类型
export interface StreamingComment extends Omit<Comment, 'content'> {
  content: string;
  generationStatus: GenerationStatus;
}

// Agent交互类型
export interface AgentInteraction {
  type: 'like' | 'dislike' | 'comment' | 'forward';
  probability: number; // 0-1之间概率值，用于决定是否执行这个交互
  content?: string; // 评论内容
}

// Agent个性设置
export interface AgentPersonality {
  name: string;
  interests: string[]; // 感兴趣的主题
  interactionFrequency: number; // 0-1，表示交互频率
  opinionated: number; // 0-1，表示多有主见
  responseStyle: 'formal' | 'casual' | 'technical' | 'enthusiastic';
}

// AI热点榜相关类型
export interface TrendingTopic {
  id: string;
  name: string;
  count: number;
  description?: string;
  relatedTags?: string[];
  popularity: number; // 0-100之间的热度值
}

export interface TrendingAnalysis {
  timestamp: string;
  topics: TrendingTopic[];
  summary?: string;
}


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
}

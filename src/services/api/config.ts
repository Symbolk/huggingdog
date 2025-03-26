// API配置

// HuggingFace API配置
export const HF_API_CONFIG = {
  baseUrl: 'https://huggingface.co',
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_HF_API_KEY || ''}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br'
  }
};

// 各模型API配置
export const MODEL_API_CONFIG = {
  'GPT-4o': {
    baseUrl: import.meta.env.VITE_OPENAI_API_BASE || 'https://api.openai.com/v1',
    model: 'gpt-4o',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || ''}`,
      'Content-Type': 'application/json'
    }
  },
  'Claude-3.5-Sonnet': {
    baseUrl: import.meta.env.VITE_ANTHROPIC_API_BASE || 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-5-sonnet-20240620',
    headers: {
      'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    }
  },
  'DeepSeek': {
    baseUrl: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY || ''}`,
      'Content-Type': 'application/json'
    }
  },
  'Llama-3': {
    baseUrl: 'https://api.fireworks.ai/inference/v1/completions',
    model: 'meta-llama/Meta-Llama-3-70B-Instruct',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_FIREWORKS_API_KEY || ''}`,
      'Content-Type': 'application/json'
    }
  },
  'Gemini-Pro': {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    model: 'gemini-pro',
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY || ''
  },
  'Mistral': {
    baseUrl: 'https://api.mistral.ai/v1/chat/completions',
    model: 'mistral-large-latest',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_MISTRAL_API_KEY || ''}`,
      'Content-Type': 'application/json'
    }
  }
};

// 添加环境变量声明
declare global {
  interface ImportMetaEnv {
    VITE_HF_API_KEY: string;
    VITE_OPENAI_API_KEY: string;
    VITE_ANTHROPIC_API_KEY: string;
    VITE_DEEPSEEK_API_KEY: string;
    VITE_FIREWORKS_API_KEY: string;
    VITE_GOOGLE_API_KEY: string;
    VITE_MISTRAL_API_KEY: string;
  }
} 
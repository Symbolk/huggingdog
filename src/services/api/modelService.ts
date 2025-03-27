
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

// 各模型API配置 - 修复类型定义，确保所有配置都有相同的结构
interface ModelConfig {
  baseUrl: string;
  model: string;
  headers: Record<string, string>;
  apiKey?: string;
}

export const MODEL_API_CONFIG: Record<string, ModelConfig> = {
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
      'Content-Type': 'application/json',
      'Authorization': '' // Add empty Authorization to satisfy type
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
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': '' // Add empty Authorization to satisfy type
    }
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

// 声明TextGenerationOptions接口
interface TextGenerationOptions {
  temperature?: number;
  maxTokens?: number;
  onToken?: (token: string) => void;
}

// 声明TextGenerationResponse接口
interface TextGenerationResponse {
  text: string;
  isComplete?: boolean;
}

// 定义ModelService类
class ModelService {
  // 生成文本方法
  async generateText(
    model: string,
    prompt: string,
    options: TextGenerationOptions = {}
  ): Promise<TextGenerationResponse> {
    // 这里是一个占位实现，实际项目中需要根据不同模型进行调用
    console.log(`Generating text with model: ${model}, prompt: ${prompt}`);
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      text: `This is a simulated response from ${model} model.`,
      isComplete: true
    };
  }
  
  // 流式生成文本方法
  async *streamText(
    model: string,
    prompt: string,
    options: TextGenerationOptions = {}
  ): AsyncGenerator<TextGenerationResponse> {
    // 模拟流式生成
    console.log(`Streaming text with model: ${model}, prompt: ${prompt}`);
    
    const words = ["Hello", "world", "this", "is", "a", "simulated", "streaming", "response", "from", model, "model"];
    
    for (let i = 0; i < words.length; i++) {
      // 模拟流式响应延迟
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const isComplete = i === words.length - 1;
      const text = words.slice(0, i + 1).join(" ");
      
      // 如果有token回调，调用它
      if (options.onToken) {
        options.onToken(words[i]);
      }
      
      yield {
        text,
        isComplete
      };
    }
  }
}

// 导出modelService实例
export const modelService = new ModelService();

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
    VITE_OPENAI_API_BASE: string;
    VITE_ANTHROPIC_API_BASE: string;
  }
}

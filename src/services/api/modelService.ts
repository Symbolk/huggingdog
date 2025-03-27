import { AIModel, LLMResponse, StreamResponse } from '../../lib/types';
import { MODEL_API_CONFIG } from './config';
import { ChatDeepSeek } from "@langchain/deepseek";
import { HumanMessage } from "@langchain/core/messages";

/**
 * LLM模型服务
 * 负责与各种LLM API交互，生成文本
 */
class ModelService {
  /**
   * 调用模型生成文本
   */
  async generateText(
    model: AIModel, 
    prompt: string, 
    options: {
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<LLMResponse> {
    const config = MODEL_API_CONFIG[model];
    
    if (!config) {
      throw new Error(`Model ${model} configuration not found`);
    }

    try {
      switch (model) {
        case 'GPT-4o':
          return this.callOpenAI(MODEL_API_CONFIG['GPT-4o'], prompt, options);
        case 'Claude-3.5-Sonnet':
          return this.callAnthropic(MODEL_API_CONFIG['Claude-3.5-Sonnet'], prompt, options);
        case 'DeepSeek':
          return this.callDeepSeek(MODEL_API_CONFIG['DeepSeek'], prompt, options);
        case 'Llama-3':
          return this.callFireworks(MODEL_API_CONFIG['Llama-3'], prompt, options);
        case 'Gemini-Pro':
          return this.callGemini(MODEL_API_CONFIG['Gemini-Pro'], prompt, options);
        case 'Mistral':
          return this.callMistral(MODEL_API_CONFIG['Mistral'], prompt, options);
        default:
          throw new Error(`Model ${model} not implemented`);
      }
    } catch (error) {
      console.error(`Error calling ${model}:`, error);
      throw error;
    }
  }
  
  /**
   * 流式生成文本
   * 使用异步迭代器，每次生成一部分文本
   */
  async *streamText(
    model: AIModel,
    prompt: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      onStart?: () => void;
      onToken?: (token: string) => void;
      onComplete?: (text: string) => void;
      onError?: (error: Error) => void;
    } = {}
  ): AsyncGenerator<StreamResponse> {
    const config = MODEL_API_CONFIG[model];
    
    if (!config) {
      throw new Error(`Model ${model} configuration not found`);
    }
    
    try {
      // 调用开始回调
      options.onStart?.();
      
      // 目前只支持 DeepSeek 的流式生成
      if (model === 'DeepSeek') {
        yield* this.streamDeepSeek(config, prompt, options);
      } else {
        // 对其他模型，模拟流式响应（非真实流式）
        const response = await this.generateText(model, prompt, options);
        
        // 将完整响应拆分为字符，每个字符作为一个流式响应
        let currentText = '';
        for (const char of response.text) {
          currentText += char;
          options.onToken?.(char);
          
          yield {
            text: currentText,
            isComplete: false
          };
          
          // 添加一点延迟以模拟流式效果
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        // 最后返回完整文本
        options.onComplete?.(response.text);
        yield {
          text: response.text,
          isComplete: true,
          usage: response.usage
        };
      }
    } catch (error) {
      console.error(`Error streaming from ${model}:`, error);
      options.onError?.(error as Error);
      throw error;
    }
  }
  
  /**
   * 使用 LangChain 流式调用 DeepSeek API
   */
  private async *streamDeepSeek(
    config: typeof MODEL_API_CONFIG['DeepSeek'],
    prompt: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      onToken?: (token: string) => void;
    }
  ): AsyncGenerator<StreamResponse> {
    try {
      // 从配置中提取API密钥
      const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
      
      // 创建DeepSeek模型实例
      const model = new ChatDeepSeek({
        apiKey: apiKey,
        modelName: "deepseek-chat", // 使用与config.model匹配的模型名称
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 500,
      });
      
      // 创建人类消息
      const humanMessage = new HumanMessage(prompt);
      
      // 流式调用模型
      const stream = await model.stream([humanMessage]);
      
      let fullText = '';
      
      for await (const chunk of stream) {
        // 提取token文本
        const token = typeof chunk.content === 'string' 
          ? chunk.content 
          : Array.isArray(chunk.content) && chunk.content.length > 0 && typeof chunk.content[0] === 'object' && 'text' in chunk.content[0]
            ? chunk.content[0].text
            : '';
            
        if (token) {
          fullText += token;
          options.onToken?.(token);
          
          yield {
            text: fullText,
            isComplete: false
          };
        }
      }
      
      // 最终结果
      yield {
        text: fullText,
        isComplete: true,
        usage: {
          promptTokens: prompt.length / 4, // 简单估算
          completionTokens: fullText.length / 4, // 简单估算
          totalTokens: (prompt.length + fullText.length) / 4
        }
      };
    } catch (error) {
      console.error('Error streaming from DeepSeek:', error);
      throw error;
    }
  }

  /**
   * 调用OpenAI API (GPT-4o)
   */
  private async callOpenAI(
    config: typeof MODEL_API_CONFIG['GPT-4o'], 
    prompt: string, 
    options: { temperature?: number; maxTokens?: number }
  ): Promise<LLMResponse> {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      text: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      }
    };
  }

  /**
   * 调用Anthropic API (Claude)
   */
  private async callAnthropic(
    config: typeof MODEL_API_CONFIG['Claude-3.5-Sonnet'], 
    prompt: string, 
    options: { temperature?: number; maxTokens?: number }
  ): Promise<LLMResponse> {
    const response = await fetch(config.baseUrl, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 500
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      text: data.content[0].text,
      usage: data.usage ? {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens
      } : undefined
    };
  }

  /**
   * 调用DeepSeek API
   */
  private async callDeepSeek(
    config: typeof MODEL_API_CONFIG['DeepSeek'], 
    prompt: string, 
    options: { temperature?: number; maxTokens?: number }
  ): Promise<LLMResponse> {
    const response = await fetch(config.baseUrl, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 500
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      text: data.choices[0].message.content,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      } : undefined
    };
  }

  /**
   * 调用Fireworks API (Llama-3)
   */
  private async callFireworks(
    config: typeof MODEL_API_CONFIG['Llama-3'], 
    prompt: string, 
    options: { temperature?: number; maxTokens?: number }
  ): Promise<LLMResponse> {
    const response = await fetch(config.baseUrl, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 500
      }),
    });

    if (!response.ok) {
      throw new Error(`Fireworks API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      text: data.choices[0].message.content,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      } : undefined
    };
  }

  /**
   * 调用Google API (Gemini)
   */
  private async callGemini(
    config: typeof MODEL_API_CONFIG['Gemini-Pro'], 
    prompt: string, 
    options: { temperature?: number; maxTokens?: number }
  ): Promise<LLMResponse> {
    const url = `${config.baseUrl}?key=${config.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 500,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      text: data.candidates[0].content.parts[0].text,
      usage: undefined // Gemini 可能不提供token使用情况
    };
  }

  /**
   * 调用Mistral API
   */
  private async callMistral(
    config: typeof MODEL_API_CONFIG['Mistral'], 
    prompt: string, 
    options: { temperature?: number; maxTokens?: number }
  ): Promise<LLMResponse> {
    const response = await fetch(config.baseUrl, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 500
      }),
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      text: data.choices[0].message.content,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      } : undefined
    };
  }
}

// 创建单例实例
export const modelService = new ModelService(); 
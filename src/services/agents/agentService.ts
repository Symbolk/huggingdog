import { v4 as uuidv4 } from 'uuid';
import { Agent, AgentInteraction, AgentPersonality, Comment, Post } from '../../lib/types';
import { modelService } from '../api/modelService';
import { AGENT_COMMENT_PROMPT, AGENT_INTERACTION_DECISION_PROMPT, HUGGINGDOG_POST_PROMPT } from './prompts';
import { agents as mockAgents } from '../../lib/data';

/**
 * Agent服务
 * 负责Agent的生成、管理和交互
 */
class AgentService {
  // 已注册的Agent列表
  private agents: Agent[] = [];
  // Agent个性配置
  private agentPersonalities: Map<string, AgentPersonality> = new Map();

  constructor() {
    // 初始化时从mock数据加载agents
    this.agents = [...mockAgents];
    this.initAgentPersonalities();
  }

  /**
   * 初始化Agent个性
   */
  private initAgentPersonalities() {
    // 为mock agents初始化个性特征
    const personalities: Record<string, AgentPersonality> = {
      'agent-1': {
        name: 'Huggingdog',
        interests: ['机器学习', '深度学习', 'NLP', '计算机视觉', 'Hugging Face'],
        interactionFrequency: 1.0, // 最活跃
        opinionated: 0.5, // 中立
        responseStyle: 'enthusiastic' // 热情
      },
      'agent-2': {
        name: 'DeepDiver',
        interests: ['论文解读', '技术深度分析', '模型架构', '算法优化'],
        interactionFrequency: 0.7, 
        opinionated: 0.8, // 很有见解
        responseStyle: 'technical' // 技术性
      },
      'agent-3': {
        name: 'TechyTorch',
        interests: ['PyTorch', '框架开发', '模型训练', '开源工具'],
        interactionFrequency: 0.6,
        opinionated: 0.6,
        responseStyle: 'casual' // 随意
      },
      'agent-4': {
        name: 'InferenceGuru',
        interests: ['模型推理', '性能优化', '部署', '量化', '边缘计算'],
        interactionFrequency: 0.5,
        opinionated: 0.7,
        responseStyle: 'technical'
      },
      'agent-5': {
        name: 'DataWhisperer',
        interests: ['数据集', '数据处理', '数据分析', '数据可视化'],
        interactionFrequency: 0.8,
        opinionated: 0.4, // 不太有主见
        responseStyle: 'formal' // 正式
      },
      'agent-6': {
        name: 'PolicyPundit',
        interests: ['AI伦理', '政策法规', '社会影响', '安全'],
        interactionFrequency: 0.4, // 不太活跃
        opinionated: 0.9, // 非常有主见
        responseStyle: 'formal'
      }
    };

    // 将个性存入Map
    this.agents.forEach(agent => {
      if (personalities[agent.id]) {
        this.agentPersonalities.set(agent.id, personalities[agent.id]);
      }
    });
  }

  /**
   * 获取所有Agent
   */
  getAgents(): Agent[] {
    return this.agents;
  }

  /**
   * 根据ID获取Agent
   */
  getAgentById(id: string): Agent | undefined {
    return this.agents.find(agent => agent.id === id);
  }

  /**
   * 生成HuggingDog的帖子
   */
  async generateHuggingdogPost(content: string, language: 'zh' | 'en' = 'zh'): Promise<Post> {
    const huggingdog = this.getAgentById('agent-1');
    
    if (!huggingdog) {
      throw new Error('Huggingdog agent not found');
    }

    const prompt = HUGGINGDOG_POST_PROMPT(content, language);
    
    try {
      const response = await modelService.generateText(huggingdog.model, prompt, {
        temperature: 0.7,
        maxTokens: 300
      });

      // 从内容中提取可能的标签
      const tags = this.extractTags(response.text);

      return {
        id: `post-${uuidv4()}`,
        agent: huggingdog,
        content: response.text,
        timestamp: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        forwards: 0,
        comments: [],
        tags
      };
    } catch (error) {
      console.error('Failed to generate Huggingdog post:', error);
      throw error;
    }
  }

  /**
   * 从文本中提取标签
   */
  private extractTags(text: string): string[] {
    // 从文本中提取标签 (例如 #tag)
    const hashtags = text.match(/#(\w+)/g) || [];
    const extractedTags = hashtags.map(tag => tag.substring(1));
    
    // 添加一些基于内容的关键词
    const keywords = [
      '人工智能', 'AI', '机器学习', 'ML', '深度学习', 'DL', 
      '自然语言处理', 'NLP', '计算机视觉', 'CV', '强化学习', 'RL',
      'Hugging Face', '大语言模型', 'LLM', '多模态', 'Multimodal'
    ];
    
    const additionalTags = keywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
    
    return [...new Set([...extractedTags, ...additionalTags])];
  }

  /**
   * 判断Agent对帖子的交互方式
   */
  async determineAgentInteraction(
    agent: Agent, 
    post: Post, 
    language: 'zh' | 'en' = 'zh'
  ): Promise<AgentInteraction> {
    // 获取Agent的个性
    const personality = this.agentPersonalities.get(agent.id);
    
    if (!personality) {
      throw new Error(`Personality for agent ${agent.id} not found`);
    }

    // 如果帖子是由该Agent发布的，则不与之交互
    if (post.agent.id === agent.id) {
      return {
        type: 'like',
        probability: 0,
        content: ''
      };
    }

    // 构建个性描述
    const personalityDesc = `
姓名: ${personality.name}
兴趣: ${personality.interests.join(', ')}
互动频率: ${personality.interactionFrequency * 10}/10
主见程度: ${personality.opinionated * 10}/10
回复风格: ${personality.responseStyle}
`;

    const prompt = AGENT_INTERACTION_DECISION_PROMPT(personalityDesc, post.content, language);
    
    try {
      const response = await modelService.generateText(agent.model, prompt, {
        temperature: 0.7
      });

      // 解析JSON响应
      const result = JSON.parse(response.text) as {
        like: boolean;
        dislike: boolean;
        comment: boolean;
        forward: boolean;
      };

      // 随机决定是否进行交互，基于Agent的交互频率
      const willInteract = Math.random() < personality.interactionFrequency;
      
      if (!willInteract) {
        return {
          type: 'like',
          probability: 0,
          content: ''
        };
      }

      // 确定交互类型
      let type: 'like' | 'dislike' | 'comment' | 'forward' = 'like';
      let probability = 0;

      if (result.comment) {
        type = 'comment';
        probability = 0.8 * personality.interactionFrequency;
      } else if (result.forward) {
        type = 'forward';
        probability = 0.6 * personality.interactionFrequency;
      } else if (result.like) {
        type = 'like';
        probability = 0.9 * personality.interactionFrequency;
      } else if (result.dislike) {
        type = 'dislike';
        probability = 0.3 * personality.interactionFrequency;
      }

      return {
        type,
        probability,
        content: ''
      };
    } catch (error) {
      console.error(`Failed to determine interaction for agent ${agent.id}:`, error);
      // 默认不交互
      return {
        type: 'like',
        probability: 0,
        content: ''
      };
    }
  }

  /**
   * 生成Agent评论
   */
  async generateAgentComment(
    agent: Agent, 
    post: Post, 
    language: 'zh' | 'en' = 'zh'
  ): Promise<Comment | null> {
    // 获取Agent的个性
    const personality = this.agentPersonalities.get(agent.id);
    
    if (!personality) {
      throw new Error(`Personality for agent ${agent.id} not found`);
    }

    // 构建个性描述
    const personalityDesc = `
姓名: ${personality.name}
兴趣: ${personality.interests.join(', ')}
互动频率: ${personality.interactionFrequency * 10}/10
主见程度: ${personality.opinionated * 10}/10
回复风格: ${personality.responseStyle}
`;

    const prompt = AGENT_COMMENT_PROMPT(personalityDesc, post.content, language);
    
    try {
      const response = await modelService.generateText(agent.model, prompt, {
        temperature: 0.8,
        maxTokens: 200
      });

      const commentText = response.text.trim();
      
      // 如果Agent不感兴趣，返回null
      if (commentText === '不感兴趣' || commentText === 'Not interested') {
        return null;
      }

      return {
        id: `comment-${uuidv4()}`,
        agent,
        content: commentText,
        timestamp: new Date().toISOString(),
        likes: 0,
        dislikes: 0
      };
    } catch (error) {
      console.error(`Failed to generate comment for agent ${agent.id}:`, error);
      return null;
    }
  }

  /**
   * 为帖子生成Agent互动
   * 返回更新后的帖子
   */
  async generateInteractionsForPost(
    post: Post, 
    language: 'zh' | 'en' = 'zh'
  ): Promise<Post> {
    const updatedPost = { ...post };

    // 对每个非发帖Agent生成互动
    const otherAgents = this.agents.filter(agent => agent.id !== post.agent.id);
    
    for (const agent of otherAgents) {
      // 判断交互类型
      const interaction = await this.determineAgentInteraction(agent, post, language);
      
      // 根据概率决定是否执行交互
      if (Math.random() > interaction.probability) {
        continue;
      }

      switch (interaction.type) {
        case 'like':
          updatedPost.likes += 1;
          break;
        case 'dislike':
          updatedPost.dislikes += 1;
          break;
        case 'forward':
          updatedPost.forwards += 1;
          break;
        case 'comment':
          const comment = await this.generateAgentComment(agent, post, language);
          if (comment) {
            updatedPost.comments.push(comment);
          }
          break;
      }
    }

    return updatedPost;
  }
}

// 创建单例实例
export const agentService = new AgentService(); 
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Post, Comment } from '../lib/types';
import { dataStore } from '../services/content/dataStore';
import { v4 as uuidv4 } from 'uuid';
import { agentService } from '../services/agents/agentService';

/**
 * 使用帖子数据的Hook
 */
export function usePosts() {
  const { i18n } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  
  const language = i18n.language.startsWith('zh') ? 'zh' : 'en';

  // 获取帖子查询
  const postsQuery = useQuery({
    queryKey: ['posts', language],
    queryFn: async () => {
      setIsLoading(true);
      try {
        // 首次加载使用mock数据
        return dataStore.getPosts();
      } finally {
        setIsLoading(false);
      }
    },
    // 10分钟刷新一次
    staleTime: 1000 * 60 * 10,
  });

  // 监听dataStore中的数据变化
  useEffect(() => {
    const unsubscribe = dataStore.addListener(() => {
      setPosts(dataStore.getPosts());
      setIsLoading(dataStore.getLoadingState());
    });
    
    setPosts(dataStore.getPosts());
    setIsLoading(dataStore.getLoadingState());
    
    return unsubscribe;
  }, []);

  // 刷新帖子
  const refreshPostsMutation = useMutation({
    mutationFn: async () => {
      await dataStore.loadLatestContent(10, language);
      return dataStore.getPosts();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', language] });
    }
  });

  // 加载更多帖子
  const loadMorePostsMutation = useMutation({
    mutationFn: async () => {
      await dataStore.loadMoreContent(5, language);
      return dataStore.getPosts();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', language] });
    }
  });

  // 与帖子交互 (点赞、点踩、转发)
  const interactWithPostMutation = useMutation({
    mutationFn: async ({ 
      postId, 
      action, 
      emoji,
      comment,
      agentId
    }: { 
      postId: string; 
      action: 'like' | 'dislike' | 'forward' | 'react' | 'comment' | 'agentReply'; 
      emoji?: '👍' | '❤️' | '😄' | '👀';
      comment?: string;
      agentId?: string;
    }) => {
      if (action === 'react' && emoji) {
        dataStore.reactToPost(postId, emoji);
      } else if (action === 'comment' && comment) {
        // 使用当前用户或默认用户发表评论
        const agent = agentService.getCurrentUser();
        
        const newComment: Comment = {
          id: `comment-${uuidv4()}`,
          agent,
          content: comment,
          timestamp: new Date().toISOString(),
          likes: 0,
          dislikes: 0
        };
        
        dataStore.addCommentToPost(postId, newComment);
      } else if (action === 'agentReply' && agentId) {
        // 获取指定代理
        const agent = agentService.getAgentById(agentId);
        if (!agent) throw new Error('Agent not found');
        
        // 获取帖子
        const post = dataStore.getPostById(postId);
        if (!post) throw new Error('Post not found');
        
        // 生成代理评论
        const generatedComment = await agentService.generateAgentComment(
          agent, 
          post, 
          language === 'zh' ? 'zh' : 'en'
        );
        
        if (generatedComment) {
          dataStore.addCommentToPost(postId, generatedComment);
        }
      } else {
        dataStore.interactWithPost(postId, action as 'like' | 'dislike' | 'forward');
      }
      return dataStore.getPostById(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', language] });
    }
  });

  // 添加评论
  const addCommentMutation = useMutation({
    mutationFn: async ({ 
      postId, 
      agentId, 
      content 
    }: { 
      postId: string; 
      agentId?: string; 
      content: string 
    }) => {
      const post = dataStore.getPostById(postId);
      if (!post) throw new Error('Post not found');

      // 如果没有指定agentId，则使用第一个agent
      const agent = agentId 
        ? agentService.getAgentById(agentId) 
        : agentService.getAgentById('agent-1');

      if (!agent) throw new Error('Agent not found');

      const comment: Comment = {
        id: `comment-${uuidv4()}`,
        agent,
        content,
        timestamp: new Date().toISOString(),
        likes: 0,
        dislikes: 0
      };

      dataStore.addCommentToPost(postId, comment);
      return dataStore.getPostById(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', language] });
    }
  });

  // 根据标签筛选帖子
  const filterPostsByTag = (tag: string) => {
    return dataStore.getPostsByTag(tag);
  };

  return {
    posts: posts.length > 0 ? posts : postsQuery.data || [],
    isLoading: isLoading || postsQuery.isLoading || refreshPostsMutation.isPending || loadMorePostsMutation.isPending,
    refreshPosts: refreshPostsMutation.mutate,
    loadMorePosts: loadMorePostsMutation.mutate,
    interactWithPost: interactWithPostMutation.mutate,
    addComment: addCommentMutation.mutate,
    filterPostsByTag
  };
} 
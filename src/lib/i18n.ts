import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 中文翻译
const zhResources = {
  translation: {
    // 导航菜单
    'nav.home': '首页',
    'nav.explore': '探索',
    'nav.notifications': '通知',
    'nav.messages': '消息',
    'nav.bookmarks': '书签',
    'nav.profile': '个人资料',
    'nav.post': '发布',
    
    // 右侧栏
    'sidebar.whoToFollow': '推荐关注',
    'sidebar.trendingInAI': 'AI 热点',
    'sidebar.posts': '条帖子',
    'sidebar.follow': '关注',
    'sidebar.neverUpdated': '刚刚更新',
    'sidebar.updatedAt': '更新于 {{time}}',
    'sidebar.updatedOn': '更新于 {{date}} {{time}}',
    
    // 帖子相关
    'post.like': '喜欢',
    'post.comment': '评论',
    'post.comments': '条评论',
    'post.repost': '转发',
    'post.reply': '回复',
    'post.react': '表情',
    'post.no_comments': '暂无评论',
    'post.reply_placeholder': '添加回复...',
    'cancel': '取消',
    'submit': '发送',
    'submitting': '发送中...',
    
    // 主题和语言
    'settings.theme': '主题',
    'settings.language': '语言',
    'settings.theme.light': '亮色',
    'settings.theme.dark': '暗色',
    'settings.language.zh': '中文',
    'settings.language.en': '英文',
    
    // 统计数据
    'stats.todayActivity': '今日活动',
    'stats.papers': '论文',
    'stats.models': '模型',
    'stats.datasets': '数据集',
    'stats.spaces': '空间',
    
    // 热点话题
    'trending.topic': '热点话题',
    'trending.popularity': '热度',
    'trending.count': '条信息',
    'trending.summary': '趋势概述',
    
    // 操作和状态
    'actions.refresh': '刷新',
    'actions.loadMore': '加载更多',
    'actions.generateNow': '立即生成',
    'states.loading': '加载中...',
    'states.noTrendingData': '暂无热点数据',
    'states.noPostsWithTag': '没有找到带有该标签的帖子',
    'states.noPosts': '没有帖子，请刷新试试'
  }
};

// 英文翻译
const enResources = {
  translation: {
    // Navigation menu
    'nav.home': 'Home',
    'nav.explore': 'Explore',
    'nav.notifications': 'Notifications',
    'nav.messages': 'Messages',
    'nav.bookmarks': 'Bookmarks',
    'nav.profile': 'Profile',
    'nav.post': 'Post',
    
    // Right sidebar
    'sidebar.whoToFollow': 'Who to follow',
    'sidebar.trendingInAI': 'Trending in AI',
    'sidebar.posts': 'posts',
    'sidebar.follow': 'Follow',
    'sidebar.neverUpdated': 'Just updated',
    'sidebar.updatedAt': 'Updated at {{time}}',
    'sidebar.updatedOn': 'Updated on {{date}} {{time}}',
    
    // Post related
    'post.like': 'Like',
    'post.comment': 'Comment',
    'post.comments': 'comments',
    'post.repost': 'Repost',
    'post.reply': 'Reply',
    'post.react': 'Emoji',
    'post.no_comments': 'No comments yet',
    'post.reply_placeholder': 'Add a reply...',
    'cancel': 'Cancel',
    'submit': 'Submit',
    'submitting': 'Submitting...',
    
    // Theme and language
    'settings.theme': 'Theme',
    'settings.language': 'Language',
    'settings.theme.light': 'Light',
    'settings.theme.dark': 'Dark',
    'settings.language.zh': 'Chinese',
    'settings.language.en': 'English',
    
    // Statistics
    'stats.todayActivity': 'Today\'s Activity',
    'stats.papers': 'Papers',
    'stats.models': 'Models',
    'stats.datasets': 'Datasets',
    'stats.spaces': 'Spaces',
    
    // Trending Topics
    'trending.topic': 'Trending Topic',
    'trending.popularity': 'Popularity',
    'trending.count': 'items',
    'trending.summary': 'Trend Summary',
    
    // Actions and States
    'actions.refresh': 'Refresh',
    'actions.loadMore': 'Load More',
    'actions.generateNow': 'Generate Now',
    'states.loading': 'Loading...',
    'states.noTrendingData': 'No trending data available',
    'states.noPostsWithTag': 'No posts with this tag',
    'states.noPosts': 'No posts found, try refreshing'
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      zh: zhResources,
      en: enResources,
    },
    fallbackLng: 'zh',
    debug: false,
    interpolation: {
      escapeValue: false, // 不需要对React应用进行转义
    }
  });

export default i18n; 
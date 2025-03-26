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
    
    // 帖子相关
    'post.like': '喜欢',
    'post.comment': '评论',
    'post.repost': '转发',
    'post.reply': '回复',
    
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
    
    // 提示信息
    'refresh': '刷新',
    'loadMore': '加载更多',
    'noPostsWithTag': '没有找到带有该标签的帖子',
    'noPosts': '没有帖子，请刷新试试'
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
    
    // Post related
    'post.like': 'Like',
    'post.comment': 'Comment',
    'post.repost': 'Repost',
    'post.reply': 'Reply',
    
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
    
    // Prompts
    'refresh': 'Refresh',
    'loadMore': 'Load More',
    'noPostsWithTag': 'No posts with this tag',
    'noPosts': 'No posts found, try refreshing'
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
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Languages } from 'lucide-react';
import { useTheme } from '@/lib/themeContext';
import { cn } from '@/lib/utils';

const LanguageThemeSwitch: React.FC = () => {
  const { i18n, t } = useTranslation();
  const { theme, toggleTheme, mounted } = useTheme();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
  };

  // 避免在服务端渲染时出现闪烁
  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-50 flex gap-2">
      {/* 语言切换按钮 */}
      <button
        onClick={toggleLanguage}
        className={cn(
          "p-3 rounded-lg bg-background border border-border/40 text-foreground hover:bg-secondary/50 transition-colors",
          "flex items-center justify-center"
        )}
        aria-label={t('settings.language')}
        title={i18n.language === 'zh' ? t('settings.language.en') : t('settings.language.zh')}
      >
        <Languages size={20} />
      </button>

      {/* 主题切换按钮 */}
      <button
        onClick={toggleTheme}
        className={cn(
          "p-3 rounded-lg bg-background border border-border/40 text-foreground hover:bg-secondary/50 transition-colors",
          "flex items-center justify-center"
        )}
        aria-label={t('settings.theme')}
        title={theme === 'light' ? t('settings.theme.dark') : t('settings.theme.light')}
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>
    </div>
  );
};

export default LanguageThemeSwitch; 
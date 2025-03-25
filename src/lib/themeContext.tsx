import React, { createContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';

type ThemeProviderProps = {
  children: React.ReactNode;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // 这里使用next-themes提供的ThemeProvider
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
    </NextThemesProvider>
  );
};

// 主题钩子，用于在组件中获取和设置主题
export const useTheme = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useNextTheme();

  // 这个只在客户端执行，确保避免服务端渲染不匹配问题
  useEffect(() => {
    setMounted(true);
  }, []);

  return {
    theme,
    setTheme,
    resolvedTheme,
    mounted,
    // 便捷方法
    isDark: mounted && (theme === 'dark' || resolvedTheme === 'dark'),
    isLight: mounted && (theme === 'light' || resolvedTheme === 'light'),
    toggleTheme: () => setTheme(theme === 'light' ? 'dark' : 'light'),
  };
};

export default ThemeProvider; 
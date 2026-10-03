import React, { createContext, useContext, useState, useEffect } from 'react';

export type UiTheme = 'editorial' | 'classic';

interface ThemeContextType {
  theme: UiTheme;
  setTheme: (theme: UiTheme) => void;
  toggleTheme: () => void;
  isEditorial: boolean;
}

const STORAGE_KEY = 'velocity_ui_theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<UiTheme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'classic' ? 'classic' : 'editorial';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
    if (theme === 'editorial') {
      document.documentElement.classList.add('theme-editorial');
      document.documentElement.classList.remove('theme-classic');
      document.body.style.backgroundColor = '#F2F0E7';
      document.body.style.color = '#092326';
    } else {
      document.documentElement.classList.add('theme-classic');
      document.documentElement.classList.remove('theme-editorial');
      document.body.style.backgroundColor = '#f8fafc';
      document.body.style.color = '#0f172a';
    }
  }, [theme]);

  const setTheme = (newTheme: UiTheme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'editorial' ? 'classic' : 'editorial'));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isEditorial: theme === 'editorial'
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

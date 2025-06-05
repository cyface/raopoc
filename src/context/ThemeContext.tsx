import React, { createContext, useContext, useState, useEffect } from 'react'
import * as lightTheme from '../styles/theme.css'
import * as darkTheme from '../styles/darkTheme.css'

export type Theme = 'light' | 'dark'

export const themeStyles = {
  light: lightTheme,
  dark: darkTheme,
}

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  styles: typeof lightTheme
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme')
    return (saved as Theme) || 'light'
  })

  useEffect(() => {
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    document.body.style.backgroundColor = theme === 'dark' ? '#0f172a' : '#ffffff'
    document.body.style.color = theme === 'dark' ? '#e2e8f0' : '#1f2937'
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const styles = themeStyles[theme]

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, styles }}>
      {children}
    </ThemeContext.Provider>
  )
}
import React, { createContext, useContext, useState, useEffect } from 'react'
import * as lightTheme from '../styles/theme.css'
import * as darkTheme from '../styles/darkTheme.css'
import * as greenTheme from '../styles/greenTheme.css'

export type Theme = 'light' | 'dark' | 'greenLight' | 'greenDark'

export const themeStyles = {
  light: lightTheme,
  dark: darkTheme,
  greenLight: greenTheme,
  greenDark: greenTheme,
}

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
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
    if (theme === 'dark') {
      document.body.style.backgroundColor = '#0f172a'
      document.body.style.color = '#e2e8f0'
    } else if (theme === 'greenLight') {
      document.body.style.backgroundColor = '#f8fdf8'
      document.body.style.color = '#1b5e20'
    } else if (theme === 'greenDark') {
      document.body.style.backgroundColor = '#0a1a0a'
      document.body.style.color = '#e8f5e8'
    } else {
      document.body.style.backgroundColor = '#ffffff'
      document.body.style.color = '#1f2937'
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const getThemeStyles = () => {
    if (theme === 'greenLight') {
      return { 
        ...lightTheme, 
        container: `${lightTheme.container} ${greenTheme.greenLightTheme}` 
      }
    }
    if (theme === 'greenDark') {
      return { 
        ...lightTheme, 
        container: `${lightTheme.container} ${greenTheme.greenDarkTheme}` 
      }
    }
    return themeStyles[theme]
  }

  const styles = getThemeStyles()

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, styles }}>
      {children}
    </ThemeContext.Provider>
  )
}
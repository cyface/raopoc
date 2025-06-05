import React, { createContext, useContext, useState, useEffect } from 'react'
import * as baseTheme from '../styles/theme.css'
import { darkTheme } from '../styles/darkTheme.css'
import { greenLightTheme, greenDarkTheme } from '../styles/greenTheme.css'
import { orangeLightTheme, orangeDarkTheme } from '../styles/orangeTheme.css'
import { configService } from '../services/configService'
import { isDarkModeRequested } from '../utils/urlParams'

export type Theme = 'light' | 'dark' | 'greenLight' | 'greenDark' | 'orangeLight' | 'orangeDark'

// Map theme names to theme classes
export const themeClasses = {
  light: baseTheme.themeClass,
  dark: darkTheme,
  greenLight: greenLightTheme,
  greenDark: greenDarkTheme,
  orangeLight: orangeLightTheme,
  orangeDark: orangeDarkTheme,
}

// All themes use the same component styles
export const themeStyles = baseTheme

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  styles: typeof baseTheme
  themeClass: string
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
  const [theme, setTheme] = useState<Theme>('light')
  const [isThemeLoaded, setIsThemeLoaded] = useState(false)

  // Load theme from bank config on mount
  useEffect(() => {
    const loadBankTheme = async () => {
      try {
        const bankInfo = await configService.getBankInfo()
        const bankTheme = bankInfo.theme
        
        if (bankTheme) {
          // Check if dark mode is requested via URL parameter
          const darkModeRequested = isDarkModeRequested()
          
          let finalTheme = bankTheme
          
          if (darkModeRequested) {
            // Force dark variant of the bank's theme
            if (bankTheme.includes('green')) {
              finalTheme = 'greenDark'
            } else if (bankTheme.includes('orange')) {
              finalTheme = 'orangeDark'
            } else {
              finalTheme = 'dark'
            }
          } else {
            // Check if user has a preference for light/dark within this bank's theme
            const saved = localStorage.getItem('theme')
            const savedTheme = saved as Theme
            
            // If saved theme is from the same theme family, use it
            if (savedTheme && 
                ((bankTheme.includes('green') && savedTheme.includes('green')) ||
                 (bankTheme.includes('orange') && savedTheme.includes('orange')) ||
                 (!bankTheme.includes('green') && !bankTheme.includes('orange') && 
                  !savedTheme.includes('green') && !savedTheme.includes('orange')))) {
              finalTheme = savedTheme
            }
          }
          
          setTheme(finalTheme)
        } else {
          // No bank theme specified, check URL parameter and saved preference
          const darkModeRequested = isDarkModeRequested()
          
          if (darkModeRequested) {
            setTheme('dark')
          } else {
            const saved = localStorage.getItem('theme')
            setTheme((saved as Theme) || 'light')
          }
        }
        
        setIsThemeLoaded(true)
      } catch (error) {
        console.error('Failed to load bank theme:', error)
        // Fall back to saved theme or default, but check dark parameter
        const darkModeRequested = isDarkModeRequested()
        
        if (darkModeRequested) {
          setTheme('dark')
        } else {
          const saved = localStorage.getItem('theme')
          setTheme((saved as Theme) || 'light')
        }
        setIsThemeLoaded(true)
      }
    }

    loadBankTheme()
  }, [])

  useEffect(() => {
    if (isThemeLoaded) {
      localStorage.setItem('theme', theme)
    }
  }, [theme, isThemeLoaded])

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
    } else if (theme === 'orangeLight') {
      document.body.style.backgroundColor = '#fff7ed'
      document.body.style.color = '#7c2d12'
    } else if (theme === 'orangeDark') {
      document.body.style.backgroundColor = '#1c0f08'
      document.body.style.color = '#fef3c7'
    } else {
      document.body.style.backgroundColor = '#ffffff'
      document.body.style.color = '#1f2937'
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => {
      // Toggle between light and dark variants of the same theme family
      switch (prev) {
        case 'light':
          return 'dark'
        case 'dark':
          return 'light'
        case 'greenLight':
          return 'greenDark'
        case 'greenDark':
          return 'greenLight'
        case 'orangeLight':
          return 'orangeDark'
        case 'orangeDark':
          return 'orangeLight'
        default:
          return 'dark'
      }
    })
  }

  const styles = themeStyles
  const themeClass = themeClasses[theme]

  // Apply theme class to root element
  useEffect(() => {
    document.documentElement.className = themeClass
  }, [themeClass])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, styles, themeClass }}>
      {children}
    </ThemeContext.Provider>
  )
}
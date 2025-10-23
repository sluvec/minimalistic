import { createContext, useContext, useState, useEffect } from 'react'

const DarkModeContext = createContext()

export function useDarkMode() {
  const context = useContext(DarkModeContext)
  if (!context) {
    throw new Error('useDarkMode must be used within DarkModeProvider')
  }
  return context
}

export function DarkModeProvider({ children }) {
  // Theme modes: 'light', 'dim', 'dim2', 'dark'
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('theme')
    if (saved && ['light', 'dim', 'dim2', 'dark'].includes(saved)) {
      return saved
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('theme', theme)

    // Apply to document
    document.documentElement.classList.remove('light-mode', 'dim-mode', 'dim2-mode', 'dark-mode')
    document.documentElement.classList.add(`${theme}-mode`)
  }, [theme])

  const cycleTheme = () => {
    setTheme(prev => {
      if (prev === 'light') return 'dim'
      if (prev === 'dim') return 'dim2'
      if (prev === 'dim2') return 'dark'
      return 'light'
    })
  }

  // Backwards compatibility
  const isDarkMode = theme === 'dark'
  const toggleDarkMode = cycleTheme

  return (
    <DarkModeContext.Provider value={{ theme, isDarkMode, cycleTheme, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  )
}

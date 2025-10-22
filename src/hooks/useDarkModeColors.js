import { useDarkMode } from '../contexts/DarkModeContext'

/**
 * Hook providing color values based on dark mode state
 * Returns an object with semantic color names that automatically switch based on theme
 */
export function useDarkModeColors() {
  const { isDarkMode } = useDarkMode()

  return {
    // Backgrounds
    background: isDarkMode ? '#1a202c' : '#ffffff',
    cardBackground: isDarkMode ? '#2d3748' : '#ffffff',
    hoverBackground: isDarkMode ? '#374151' : '#f7fafc',
    lightBackground: isDarkMode ? '#2d3748' : '#f7fafc',
    darkerBackground: isDarkMode ? '#111827' : '#edf2f7',

    // Text colors
    textPrimary: isDarkMode ? '#e2e8f0' : '#1a202c',
    textSecondary: isDarkMode ? '#cbd5e0' : '#4a5568',
    textMuted: isDarkMode ? '#a0aec0' : '#718096',

    // Borders
    border: isDarkMode ? '#4a5568' : '#e2e8f0',
    borderLight: isDarkMode ? '#374151' : '#cbd5e0',

    // Interactive elements
    primary: isDarkMode ? '#63b3ed' : '#4299e1',
    primaryHover: isDarkMode ? '#4299e1' : '#3182ce',
    success: isDarkMode ? '#68d391' : '#38a169',
    warning: isDarkMode ? '#f6ad55' : '#ed8936',
    danger: isDarkMode ? '#fc8181' : '#e53e3e',

    // Badges and chips
    chipBackground: isDarkMode ? '#4a5568' : '#e2e8f0',
    chipBackgroundActive: isDarkMode ? '#63b3ed' : '#4299e1',
    chipText: isDarkMode ? '#e2e8f0' : '#2d3748',
    chipTextActive: isDarkMode ? '#1a202c' : '#ffffff',

    // Table specific
    tableHeaderBackground: isDarkMode ? '#2d3748' : '#edf2f7',
    tableRowEven: isDarkMode ? '#2d3748' : '#ffffff',
    tableRowOdd: isDarkMode ? '#374151' : '#f7fafc',
    tableRowHover: isDarkMode ? '#4a5568' : '#edf2f7',

    // Input fields
    inputBackground: isDarkMode ? '#2d3748' : '#ffffff',
    inputBorder: isDarkMode ? '#4a5568' : '#e2e8f0',
    inputFocus: isDarkMode ? '#63b3ed' : '#4299e1',

    // Shadows
    shadow: isDarkMode ? '0 2px 4px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
    shadowLarge: isDarkMode ? '0 4px 8px rgba(0, 0, 0, 0.4)' : '0 4px 8px rgba(0, 0, 0, 0.15)',
  }
}

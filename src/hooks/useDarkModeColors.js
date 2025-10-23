import { useDarkMode } from '../contexts/DarkModeContext'
import { colors, darkColors, lightColors, shadows } from '../styles/design-tokens'

/**
 * Hook providing color values based on dark mode state
 * Returns an object with semantic color names that automatically switch based on theme
 * Now uses design tokens for consistency
 */
export function useDarkModeColors() {
  const { isDarkMode } = useDarkMode()

  return {
    // Backgrounds
    background: isDarkMode ? darkColors.background : lightColors.background,
    cardBackground: isDarkMode ? darkColors.surface : lightColors.surface,
    hoverBackground: isDarkMode ? darkColors.surfaceLight : lightColors.surfaceLight,
    lightBackground: isDarkMode ? darkColors.backgroundLight : lightColors.backgroundLight,
    darkerBackground: isDarkMode ? darkColors.backgroundDark : lightColors.backgroundDark,

    // Text colors
    textPrimary: isDarkMode ? darkColors.textPrimary : lightColors.textPrimary,
    textSecondary: isDarkMode ? darkColors.textSecondary : lightColors.textSecondary,
    textMuted: isDarkMode ? darkColors.textMuted : lightColors.textMuted,

    // Borders
    border: isDarkMode ? darkColors.border : lightColors.border,
    borderLight: isDarkMode ? darkColors.borderLight : lightColors.borderLight,

    // Interactive elements
    primary: isDarkMode ? colors.primaryLight : colors.primary,
    primaryHover: isDarkMode ? colors.primary : colors.primaryHover,
    success: isDarkMode ? colors.successLight : colors.successDark,
    warning: isDarkMode ? colors.warningLight : colors.warning,
    danger: isDarkMode ? colors.dangerLight : colors.danger,

    // Badges and chips
    chipBackground: isDarkMode ? colors.gray600 : colors.gray200,
    chipBackgroundActive: isDarkMode ? colors.primaryLight : colors.primary,
    chipText: isDarkMode ? colors.gray100 : colors.gray700,
    chipTextActive: isDarkMode ? colors.gray900 : colors.white,

    // Table specific
    tableHeaderBackground: isDarkMode ? darkColors.surface : colors.gray100,
    tableRowEven: isDarkMode ? darkColors.surface : colors.white,
    tableRowOdd: isDarkMode ? darkColors.surfaceLight : colors.gray50,
    tableRowHover: isDarkMode ? darkColors.surfaceLight : colors.gray100,

    // Input fields
    inputBackground: isDarkMode ? darkColors.surface : colors.white,
    inputBorder: isDarkMode ? darkColors.border : lightColors.border,
    inputFocus: isDarkMode ? colors.primaryLight : colors.primary,

    // Shadows
    shadow: isDarkMode ? '0 2px 4px rgba(0, 0, 0, 0.3)' : shadows.base,
    shadowLarge: isDarkMode ? '0 4px 8px rgba(0, 0, 0, 0.4)' : shadows.lg,
  }
}

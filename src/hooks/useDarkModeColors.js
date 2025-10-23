import { useDarkMode } from '../contexts/DarkModeContext'
import { colors, darkColors, lightColors, dimColors, shadows } from '../styles/design-tokens'

/**
 * Hook providing color values based on theme mode
 * Returns an object with semantic color names that automatically switch based on theme
 * Supports light, dim, and dark modes
 */
export function useDarkModeColors() {
  const { theme, isDarkMode } = useDarkMode()

  const getColor = (lightVal, dimVal, darkVal) => {
    if (theme === 'dark') return darkVal
    if (theme === 'dim') return dimVal
    return lightVal
  }

  return {
    // Backgrounds
    background: getColor(lightColors.background, dimColors.background, darkColors.background),
    cardBackground: getColor(lightColors.surface, dimColors.surface, darkColors.surface),
    hoverBackground: getColor(lightColors.surfaceLight, dimColors.surfaceLight, darkColors.surfaceLight),
    lightBackground: getColor(lightColors.backgroundLight, dimColors.backgroundLight, darkColors.backgroundLight),
    darkerBackground: getColor(lightColors.backgroundDark, dimColors.backgroundDark, darkColors.backgroundDark),

    // Text colors
    textPrimary: getColor(lightColors.textPrimary, dimColors.textPrimary, darkColors.textPrimary),
    textSecondary: getColor(lightColors.textSecondary, dimColors.textSecondary, darkColors.textSecondary),
    textMuted: getColor(lightColors.textMuted, dimColors.textMuted, darkColors.textMuted),

    // Borders
    border: getColor(lightColors.border, dimColors.border, darkColors.border),
    borderLight: getColor(lightColors.borderLight, dimColors.borderLight, darkColors.borderLight),

    // Interactive elements
    primary: isDarkMode ? colors.primaryLight : colors.primary,
    primaryHover: isDarkMode ? colors.primary : colors.primaryHover,
    success: isDarkMode ? colors.successLight : colors.successDark,
    warning: isDarkMode ? colors.warningLight : colors.warning,
    danger: isDarkMode ? colors.dangerLight : colors.danger,

    // Badges and chips
    chipBackground: getColor(colors.gray200, colors.gray300, colors.gray600),
    chipBackgroundActive: isDarkMode ? colors.primaryLight : colors.primary,
    chipText: getColor(colors.gray700, colors.gray800, colors.gray100),
    chipTextActive: isDarkMode ? colors.gray900 : colors.white,

    // Table specific
    tableHeaderBackground: getColor(colors.gray100, colors.gray200, darkColors.surface),
    tableRowEven: getColor(colors.white, dimColors.surface, darkColors.surface),
    tableRowOdd: getColor(colors.gray50, dimColors.surfaceLight, darkColors.surfaceLight),
    tableRowHover: getColor(colors.gray100, dimColors.surfaceLight, darkColors.surfaceLight),

    // Input fields
    inputBackground: getColor(colors.white, dimColors.surface, darkColors.surface),
    inputBorder: getColor(lightColors.border, dimColors.border, darkColors.border),
    inputFocus: isDarkMode ? colors.primaryLight : colors.primary,

    // Shadows
    shadow: theme === 'dark' ? '0 2px 4px rgba(0, 0, 0, 0.3)' : theme === 'dim' ? '0 1px 3px rgba(0, 0, 0, 0.15)' : shadows.base,
    shadowLarge: theme === 'dark' ? '0 4px 8px rgba(0, 0, 0, 0.4)' : theme === 'dim' ? '0 4px 6px rgba(0, 0, 0, 0.2)' : shadows.lg,
  }
}

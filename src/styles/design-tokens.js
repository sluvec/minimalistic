/**
 * Design Tokens - Single source of truth for design values
 * This file defines all colors, spacing, typography, and other design constants
 */

// Color Palette
export const colors = {
  // Primary colors
  primary: '#4299e1',
  primaryHover: '#3182ce',
  primaryLight: '#63b3ed',
  primaryDark: '#2c5282',

  // Semantic colors
  success: '#48bb78',
  successLight: '#68d391',
  successDark: '#38a169',

  warning: '#ed8936',
  warningLight: '#f6ad55',
  warningDark: '#dd6b20',

  danger: '#f56565',
  dangerLight: '#fc8181',
  dangerDark: '#e53e3e',

  info: '#4299e1',
  infoLight: '#63b3ed',
  infoDark: '#3182ce',

  // Neutral colors - Light mode
  gray50: '#f7fafc',
  gray100: '#edf2f7',
  gray200: '#e2e8f0',
  gray300: '#cbd5e0',
  gray400: '#a0aec0',
  gray500: '#718096',
  gray600: '#4a5568',
  gray700: '#2d3748',
  gray800: '#1a202c',
  gray900: '#171923',

  // Background colors
  white: '#ffffff',
  black: '#000000',
}

// Dark mode colors
export const darkColors = {
  background: '#1a202c',
  backgroundLight: '#2d3748',
  backgroundDark: '#171923',

  surface: '#2d3748',
  surfaceLight: '#4a5568',
  surfaceDark: '#1a202c',

  textPrimary: '#f7fafc',
  textSecondary: '#cbd5e0',
  textMuted: '#a0aec0',

  border: '#4a5568',
  borderLight: '#718096',
}

// Light mode colors
export const lightColors = {
  background: '#f7fafc',
  backgroundLight: '#ffffff',
  backgroundDark: '#edf2f7',

  surface: '#ffffff',
  surfaceLight: '#f7fafc',
  surfaceDark: '#edf2f7',

  textPrimary: '#1a202c',
  textSecondary: '#4a5568',
  textMuted: '#718096',

  border: '#e2e8f0',
  borderLight: '#edf2f7',
}

// Dim mode colors (darker light mode - between light and dark)
export const dimColors = {
  background: '#e2e8f0',
  backgroundLight: '#edf2f7',
  backgroundDark: '#cbd5e0',

  surface: '#edf2f7',
  surfaceLight: '#f7fafc',
  surfaceDark: '#e2e8f0',

  textPrimary: '#1a202c',
  textSecondary: '#2d3748',
  textMuted: '#4a5568',

  border: '#cbd5e0',
  borderLight: '#e2e8f0',
}

// Dim2 mode colors (darker background, same surface as dim)
export const dim2Colors = {
  background: '#a0aec0',  // Much darker than dim
  backgroundLight: '#cbd5e0',
  backgroundDark: '#718096',

  surface: '#edf2f7',  // Same as dim - keeps cards light
  surfaceLight: '#f7fafc',
  surfaceDark: '#e2e8f0',

  textPrimary: '#1a202c',
  textSecondary: '#2d3748',
  textMuted: '#4a5568',

  border: '#cbd5e0',
  borderLight: '#e2e8f0',
}

// Spacing scale (8px base)
export const spacing = {
  xxs: '0.25rem',  // 4px
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  xxl: '3rem',     // 48px
  xxxl: '4rem',    // 64px
}

// Typography scale
export const typography = {
  // Font families
  fontFamily: {
    base: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
  },

  // Font sizes
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },

  // Font weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
}

// Border radius
export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  base: '0.375rem',// 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  full: '9999px',  // circle
}

// Shadows
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
}

// Z-index scale
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
}

// Transitions
export const transitions = {
  fast: '150ms ease-in-out',
  base: '200ms ease-in-out',
  slow: '300ms ease-in-out',
  slower: '500ms ease-in-out',
}

// Breakpoints
export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

// Component-specific tokens
export const components = {
  button: {
    paddingX: spacing.md,
    paddingY: spacing.sm,
    borderRadius: borderRadius.md,
    fontWeight: typography.fontWeight.medium,
    transition: transitions.base,
  },

  input: {
    paddingX: spacing.md,
    paddingY: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: '1px',
    transition: transitions.base,
  },

  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    shadow: shadows.base,
  },

  badge: {
    paddingX: spacing.sm,
    paddingY: spacing.xxs,
    borderRadius: borderRadius.base,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
}

// Badge color variants - Optimized for WCAG AA contrast
export const badgeVariants = {
  default: {
    light: {
      bg: colors.gray200,
      color: colors.gray800,
    },
    dim: {
      bg: colors.gray300,
      color: colors.gray800,
    },
    dim2: {
      bg: colors.gray300,
      color: colors.gray800,
    },
    dark: {
      bg: colors.gray600,
      color: colors.gray100,
    }
  },
  primary: {
    light: {
      bg: '#bee3f8',
      color: '#1a365d',
    },
    dim: {
      bg: '#90cdf4',
      color: '#1a365d',
    },
    dim2: {
      bg: '#90cdf4',
      color: '#1a365d',
    },
    dark: {
      bg: '#2c5282',
      color: '#e6fffa',
    }
  },
  success: {
    light: {
      bg: '#c6f6d5',
      color: '#1c4532',
    },
    dim: {
      bg: '#9ae6b4',
      color: '#1c4532',
    },
    dim2: {
      bg: '#9ae6b4',
      color: '#1c4532',
    },
    dark: {
      bg: '#22543d',
      color: '#c6f6d5',
    }
  },
  warning: {
    light: {
      bg: '#feebc8',
      color: '#7c2d12',
    },
    dim: {
      bg: '#fbd38d',
      color: '#7c2d12',
    },
    dim2: {
      bg: '#fbd38d',
      color: '#7c2d12',
    },
    dark: {
      bg: '#c05621',
      color: '#fffbeb',
    }
  },
  danger: {
    light: {
      bg: '#fed7d7',
      color: '#7f1d1d',
    },
    dim: {
      bg: '#fc8181',
      color: '#7f1d1d',
    },
    dim2: {
      bg: '#fc8181',
      color: '#7f1d1d',
    },
    dark: {
      bg: '#c53030',
      color: '#fef2f2',
    }
  },
  info: {
    light: {
      bg: '#bee3f8',
      color: '#1e3a8a',
    },
    dim: {
      bg: '#90cdf4',
      color: '#1e3a8a',
    },
    dim2: {
      bg: '#90cdf4',
      color: '#1e3a8a',
    },
    dark: {
      bg: '#2563eb',
      color: '#eff6ff',
    }
  },
  purple: {
    light: {
      bg: '#e9d8fd',
      color: '#4c1d95',
    },
    dim: {
      bg: '#d6bcfa',
      color: '#4c1d95',
    },
    dim2: {
      bg: '#d6bcfa',
      color: '#4c1d95',
    },
    dark: {
      bg: '#6b21a8',
      color: '#f3e8ff',
    }
  },
  yellow: {
    light: {
      bg: '#fef3c7',
      color: '#713f12',
    },
    dim: {
      bg: '#fde68a',
      color: '#713f12',
    },
    dim2: {
      bg: '#fde68a',
      color: '#713f12',
    },
    dark: {
      bg: '#a16207',
      color: '#fefce8',
    }
  },
}

// Helper function to get badge variant based on theme mode
export const getBadgeVariant = (variant, theme) => {
  const v = badgeVariants[variant] || badgeVariants.default

  // Support both old isDarkMode boolean and new theme string
  if (typeof theme === 'boolean') {
    return theme ? v.dark : v.light
  }

  // New theme-based approach
  if (theme === 'dark') return v.dark
  if (theme === 'dim2') return v.dim2
  if (theme === 'dim') return v.dim
  return v.light
}

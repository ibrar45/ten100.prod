export const theme = {
  colors: {
    primary: '#FF385C',
    secondary: '#222222',
    background: '#F7F7F7',
    surface: '#FFFFFF',
    textPrimary: '#222222',
    textSecondary: '#717171',
    border: '#DDDDDD',
    success: '#2ecc71',
    danger: '#e74c3c',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 6,
    md: 12,
    lg: 16,
  },
  shadow: {
    card: '0 4px 12px rgba(0,0,0,0.08)',
  },
}

export const cssThemeVariables = {
  '--color-primary': theme.colors.primary,
  '--color-secondary': theme.colors.secondary,
  '--color-background': theme.colors.background,
  '--color-surface': theme.colors.surface,
  '--color-text-primary': theme.colors.textPrimary,
  '--color-text-secondary': theme.colors.textSecondary,
  '--color-border': theme.colors.border,
  '--color-success': theme.colors.success,
  '--color-danger': theme.colors.danger,
  '--radius-sm': `${theme.radius.sm}px`,
  '--radius-md': `${theme.radius.md}px`,
  '--radius-lg': `${theme.radius.lg}px`,
  '--space-xs': `${theme.spacing.xs}px`,
  '--space-sm': `${theme.spacing.sm}px`,
  '--space-md': `${theme.spacing.md}px`,
  '--space-lg': `${theme.spacing.lg}px`,
  '--space-xl': `${theme.spacing.xl}px`,
  '--shadow-card': theme.shadow.card,
}

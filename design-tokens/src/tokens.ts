/**
 * Design Tokens - Sistema Dra. Bruna
 * Tokens centralizados para identidade visual unificada
 */

// Cores da marca Dra. Bruna - Design Dourado/Preto
export const colors = {
  // Cores primárias - Dourado
  primary: {
    50: '#FEF9E7',
    100: '#FDF2CF',
    200: '#FBE59F',
    300: '#F9D86F',
    400: '#F7CB3F',
    500: '#D4AF37', // Cor principal da marca - Dourado
    600: '#B8941F',
    700: '#9C7907',
    800: '#805E00',
    900: '#644300',
    DEFAULT: '#D4AF37',
    foreground: '#000000',
  },
  
  // Cores secundárias (neutras)
  secondary: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    DEFAULT: '#F5F5F5',
    foreground: '#000000',
  },
  
  // Cores de destaque
  accent: {
    50: '#E6F7F5',
    100: '#CCEFEB',
    200: '#99DFD7',
    300: '#66CFC3',
    400: '#33BFAF',
    500: '#2D9C8F',
    600: '#247D73',
    700: '#1B5E57',
    800: '#123F3B',
    900: '#09201F',
    DEFAULT: '#2D9C8F',
    foreground: '#ffffff',
  },
  
  // Cores de estado
  destructive: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#DC2626',
    600: '#B91C1C',
    700: '#991B1B',
    800: '#7F1D1D',
    900: '#651313',
    DEFAULT: '#DC2626',
    foreground: '#ffffff',
  },
  
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#16A34A',
    600: '#15803D',
    700: '#166534',
    800: '#14532D',
    900: '#14532D',
    DEFAULT: '#16A34A',
    foreground: '#ffffff',
  },
  
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
    DEFAULT: '#F59E0B',
    foreground: '#1F2937',
  },
  
  // Cores neutras
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Cores semânticas para UI
  background: '#ffffff',
  foreground: '#000000',
  card: '#ffffff',
  'card-foreground': '#000000',
  popover: '#ffffff',
  'popover-foreground': '#000000',
  muted: '#F5F5F5',
  'muted-foreground': '#6B7280', // Melhorado para AA compliance
  border: '#D1D5DB',
  input: '#D1D5DB',
  ring: '#D4AF37', // Dourado da marca para foco
  
  // Custom Brand Colors
  gold: '#D4AF37', // Dourado
  black: '#000000', // Preto
  'light-gray': '#F5F5F5', // Cinza claro
  'soft-pink': '#F8BBD9', // Rosa suave
} as const;

// Espaçamento baseado em 8px
export const spacing = {
  0: '0px',
  1: '8px',
  2: '12px',
  3: '16px',
  4: '24px',
  5: '32px',
  6: '48px',
  7: '64px',
  8: '96px',
  9: '128px',
} as const;

// Raios de borda
export const borderRadius = {
  none: '0px',
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
} as const;

// Tipografia
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    heading: ['Playfair Display', 'serif'],
    serif: ['Playfair Display', 'serif'],
  },
  fontSize: {
    xs: ['12px', { lineHeight: '1.5', fontWeight: '400' }],
    sm: ['14px', { lineHeight: '1.5', fontWeight: '400' }],
    base: ['16px', { lineHeight: '1.6', fontWeight: '400' }],
    lg: ['18px', { lineHeight: '1.6', fontWeight: '400' }],
    xl: ['20px', { lineHeight: '1.4', fontWeight: '500' }],
    '2xl': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
    '3xl': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
    '4xl': ['40px', { lineHeight: '1.1', fontWeight: '700' }],
    '5xl': ['48px', { lineHeight: '1', fontWeight: '700' }],
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.1',
    snug: '1.2',
    normal: '1.3',
    relaxed: '1.4',
    loose: '1.5',
    'extra-loose': '1.6',
  },
} as const;

// Sombras
export const boxShadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
} as const;

// Animações
export const animation = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Z-index
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Estados de foco
export const focus = {
  ring: {
    width: '2px',
    offset: '2px',
    color: colors.ring, // Dourado
  },
  outline: 'none',
} as const;

// Variantes de botões
export const buttonVariants = {
  primary: {
    background: colors.primary.DEFAULT,
    color: colors.primary.foreground,
    hover: colors.primary[600],
    disabled: colors.neutral[300],
    'disabled-foreground': colors.neutral[500],
  },
  secondary: {
    background: colors.secondary.DEFAULT,
    color: colors.secondary.foreground,
    hover: colors.secondary[200],
    disabled: colors.neutral[200],
    'disabled-foreground': colors.neutral[400],
  },
  destructive: {
    background: colors.destructive.DEFAULT,
    color: colors.destructive.foreground,
    hover: colors.destructive[600],
    disabled: colors.neutral[300],
    'disabled-foreground': colors.neutral[500],
  },
  outline: {
    background: 'transparent',
    color: colors.foreground,
    border: colors.border,
    hover: colors.neutral[50],
    disabled: 'transparent',
    'disabled-foreground': colors.neutral[400],
  },
  ghost: {
    background: 'transparent',
    color: colors.foreground,
    hover: colors.neutral[100],
    disabled: 'transparent',
    'disabled-foreground': colors.neutral[400],
  },
} as const;

// Exportar todos os tokens
export const designTokens = {
  colors,
  spacing,
  borderRadius,
  typography,
  boxShadow,
  animation,
  breakpoints,
  zIndex,
  focus,
  buttonVariants,
} as const;

export default designTokens;

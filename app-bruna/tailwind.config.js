/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Paleta Dra. Bruna
        primary: {
          DEFAULT: '#3A7CA5',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#F5F6F8',
          foreground: '#1F2937',
        },
        accent: {
          DEFAULT: '#2D9C8F',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#DC2626',
          foreground: '#ffffff',
        },
        success: {
          DEFAULT: '#16A34A',
          foreground: '#ffffff',
        },
        warning: {
          DEFAULT: '#F59E0B',
          foreground: '#1F2937',
        },
        border: '#D1D5DB',
        input: '#D1D5DB',
        ring: '#3A7CA5',
        background: '#ffffff',
        foreground: '#1F2937',
        muted: {
          DEFAULT: '#F5F6F8',
          foreground: '#6B7280',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#1F2937',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#1F2937',
        },
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '6px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'h1': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['20px', { lineHeight: '1.4', fontWeight: '500' }],
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'small': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Base surfaces
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-raised': 'rgb(var(--surface-raised) / <alpha-value>)',
        'surface-sunken': 'rgb(var(--surface-sunken) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        'border-strong': 'rgb(var(--border-strong) / <alpha-value>)',

        // Text
        'text-primary': 'rgb(var(--text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
        'text-tertiary': 'rgb(var(--text-tertiary) / <alpha-value>)',
        'text-on-accent': 'rgb(var(--text-on-accent) / <alpha-value>)',

        // Primary accent — trust teal
        'accent-trust': {
          DEFAULT: 'rgb(var(--accent-trust) / <alpha-value>)',
          strong: 'rgb(var(--accent-trust-strong) / <alpha-value>)',
          soft: 'rgb(var(--accent-trust-soft) / <alpha-value>)',
        },

        // Semantic financial states
        'pnl-positive': 'rgb(var(--pnl-positive) / <alpha-value>)',
        'pnl-negative': 'rgb(var(--pnl-negative) / <alpha-value>)',
        'risk-warning': 'rgb(var(--risk-warning) / <alpha-value>)',
        'risk-critical': 'rgb(var(--risk-critical) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        xs: ['0.8125rem', { lineHeight: '1.25rem' }],
        sm: ['0.9375rem', { lineHeight: '1.4rem' }],
        base: ['1.125rem', { lineHeight: '1.7rem' }],
        lg: ['1.25rem', { lineHeight: '1.8rem' }],
        xl: ['1.5rem', { lineHeight: '2rem' }],
        '2xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '3xl': ['2.375rem', { lineHeight: '2.75rem' }],
        '4xl': ['3rem', { lineHeight: '3.4rem' }],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        md: '10px',
        lg: '14px',
        xl: '18px',
      },
      boxShadow: {
        panel: '0 1px 0 0 rgb(var(--border)), 0 12px 32px -16px rgb(0 0 0 / 0.5)',
      },
      transitionTimingFunction: {
        confident: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 0.61, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};

export default config;

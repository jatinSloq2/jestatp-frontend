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
        // Groww spec: a single Inter family for everything, including
        // tabular figures (see .font-mono / .tabular in globals.css).
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.1rem' }],
        sm: ['0.8125rem', { lineHeight: '1.25rem' }],
        base: ['0.9375rem', { lineHeight: '1.5rem' }],
        lg: ['1.0625rem', { lineHeight: '1.6rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '1.9rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.5rem', { lineHeight: '2.75rem' }],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '12px',
        lg: '20px',
        xl: '24px',
      },
      boxShadow: {
        panel: '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 10px 28px -14px rgb(45 52 60 / 0.14)',
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
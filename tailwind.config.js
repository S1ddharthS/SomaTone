/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0A0A0A',
        charcoal: '#121212',
        surface: '#1A1A1A',
        'surface-elevated': '#222222',
        'surface-glass': 'rgba(26, 26, 26, 0.65)',
        border: {
          DEFAULT: '#2A2A2A',
          warm: '#3A3530',
          cool: '#2E3338',
        },
        sage: {
          DEFAULT: '#7C9A82',
          dim: '#5A7360',
          glow: 'rgba(124, 154, 130, 0.15)',
        },
        amber: {
          DEFAULT: '#D4A847',
          dim: '#A68335',
          glow: 'rgba(212, 168, 71, 0.15)',
        },
        rose: {
          DEFAULT: '#B87D7D',
          dim: '#8E5E5E',
          glow: 'rgba(184, 125, 125, 0.15)',
        },
        lavender: {
          DEFAULT: '#9B8EC4',
          dim: '#7A6DA0',
          glow: 'rgba(155, 142, 196, 0.15)',
        },
        sky: {
          DEFAULT: '#7AACBF',
          dim: '#5E8999',
          glow: 'rgba(122, 172, 191, 0.15)',
        },
        text: {
          primary: '#E8E4E0',
          secondary: '#B0ACA8',
          muted: '#706C68',
          inverse: '#0A0A0A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'system': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.08em' }],
        'label': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.06em' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.375rem' }],
        'body': ['0.9375rem', { lineHeight: '1.5rem' }],
        'heading-sm': ['1.125rem', { lineHeight: '1.5rem', fontWeight: '500' }],
        'heading': ['1.5rem', { lineHeight: '2rem', fontWeight: '500' }],
        'display-sm': ['2rem', { lineHeight: '2.5rem', fontWeight: '300' }],
        'display': ['3rem', { lineHeight: '3.5rem', fontWeight: '200' }],
      },
      animation: {
        'breathe': 'breathe 4s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'fade-in': 'fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-delayed': 'fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards',
        'slide-up': 'slide-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up-delayed': 'slide-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scale-in': 'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', opacity: '1' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.6' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'human': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      boxShadow: {
        'glow-sage': '0 0 30px rgba(124, 154, 130, 0.12)',
        'glow-amber': '0 0 30px rgba(212, 168, 71, 0.12)',
        'glow-rose': '0 0 30px rgba(184, 125, 125, 0.12)',
        'inner-subtle': 'inset 0 1px 0 rgba(255, 255, 255, 0.03)',
      },
    },
  },
  plugins: [],
};

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        space: {
          void: '#060610',
          dark: '#0b0b18',
          surface: '#10101e',
          panel: 'rgba(16,20,40,0.7)',
          border: 'rgba(126,184,212,0.15)',
          blue: '#7eb8d4',
          'blue-bright': '#a8d8ee',
          'blue-dim': '#3d7a9a',
          text: '#d8e8f0',
          muted: '#5a7a8a',
          success: '#4ade80',
          warning: '#fb923c',
          danger: '#f87171',
        },
      },
      fontFamily: {
        // Title: Times New Roman italic bold
        display: ['"Times New Roman"', 'Georgia', 'Times', 'serif'],
        // All else: Pretendard
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['Pretendard', '-apple-system', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'space-gradient': 'radial-gradient(ellipse at top, #0d1428 0%, #060610 70%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(126,184,212,0.08) 0%, rgba(126,184,212,0.02) 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config

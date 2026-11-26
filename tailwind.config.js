/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: {
          950: '#06040e',
          900: '#0c0818',
          850: '#100c1f',
          800: '#16122a',
          700: '#1e1838',
          600: '#2a2248',
        },
        violet: {
          glow: '#a78bfa',
          soft: '#8b5cf6',
          deep: '#7c3aed',
          neon: '#c084fc',
        },
        magenta: {
          DEFAULT: '#e879f9',
          dim: '#d946ef',
        },
      },
      fontFamily: {
        sans: ['Onest', 'system-ui', 'sans-serif'],
        display: ['Unbounded', 'Onest', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'glow-sm': '0 0 20px rgba(139, 92, 246, 0.25)',
        'glow': '0 0 40px rgba(139, 92, 246, 0.35)',
        'glow-lg': '0 0 80px rgba(139, 92, 246, 0.2)',
      },
      keyframes: {
        'pulse-bar': {
          '0%, 100%': { opacity: '0.35', transform: 'scaleY(0.55)' },
          '50%': { opacity: '1', transform: 'scaleY(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'pulse-bar': 'pulse-bar 1.1s ease-in-out infinite',
        float: 'float 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

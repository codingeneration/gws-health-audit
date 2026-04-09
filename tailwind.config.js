/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#080c14',
        surface: '#0f1623',
        elevated: '#161d2e',
        border: '#1e2d45',
        'border-bright': '#2a3f5f',
        accent: '#4f9cf9',
        'accent-dim': '#1a3a6b',
        green: '#34d399',
        'green-dim': '#0d2e20',
        yellow: '#fbbf24',
        'yellow-dim': '#2e2008',
        red: '#f87171',
        'red-dim': '#2e0e0e',
        'text-primary': '#e8eef7',
        'text-secondary': '#7a93b8',
        'text-muted': '#445570',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 2s linear infinite',
        'scan': 'scan 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scan: { '0%, 100%': { transform: 'translateY(0%)' }, '50%': { transform: 'translateY(200%)' } },
      },
    },
  },
  plugins: [],
}

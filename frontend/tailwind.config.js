/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        surface: {
          900: '#050a14',
          800: '#0a1628',
          700: '#0d1f35',
          600: '#112240',
        },
        score: {
          excellent: '#10b981',
          good:      '#3b82f6',
          fair:      '#f59e0b',
          poor:      '#ef4444',
        },
      },
      animation: {
        'float':        'float 6s ease-in-out infinite',
        'pulse-glow':   'pulse-glow 2.5s ease-in-out infinite',
        'slide-up':     'slide-up 0.6s ease forwards',
        'shimmer':      'shimmer 1.5s infinite',
        'spin-slow':    'spin 3s linear infinite',
        'counter':      'counter-up 0.4s ease forwards',
      },
      keyframes: {
        float:        { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        'pulse-glow': { '0%,100%': { boxShadow: '0 0 20px rgba(59,130,246,0.3)' }, '50%': { boxShadow: '0 0 50px rgba(59,130,246,0.6)' } },
        'slide-up':   { from: { opacity: '0', transform: 'translateY(30px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer:      { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'counter-up': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      backdropBlur: { xs: '4px' },
      boxShadow: {
        glow:    '0 0 40px rgba(59,130,246,0.15)',
        'glow-lg': '0 0 80px rgba(59,130,246,0.25)',
        card:    '0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
};

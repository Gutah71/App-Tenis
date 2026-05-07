/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#22c55e',
          'green-dark': '#16a34a',
          'green-light': '#4ade80',
          black: '#0a0a0a',
          'surface-1': '#111111',
          'surface-2': '#1a1a1a',
          'surface-3': '#242424',
          border: '#2a2a2a',
          'border-light': '#3a3a3a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-court': "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.85)), url('https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1600&q=80')",
      },
    },
  },
  plugins: [],
};

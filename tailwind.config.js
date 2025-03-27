/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-in-delay': 'fadeIn 0.8s ease-out 0.3s forwards',
        'bounce-slow': 'bounceSlow 2s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
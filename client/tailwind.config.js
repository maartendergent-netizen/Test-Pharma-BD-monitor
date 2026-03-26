/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        surface: {
          0: '#0f1117',
          1: '#161b27',
          2: '#1c2333',
          3: '#232b3e',
        },
        brand: {
          DEFAULT: '#4f8ef7',
          dim: '#3b6fd4',
        },
      },
    },
  },
  plugins: [],
};

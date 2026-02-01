/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          dark: '#001317',
          cyan: '#00fff3',
        },
        'dark': {
          900: '#0a0a0a',
          800: '#1a1a1a',
          700: '#2a2a2a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

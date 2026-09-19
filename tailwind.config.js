/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: { 700: '#E2B4BD', 900: '#FFF5F5', 950: '#FFF5F5' },
        blue: { 50: '#FFF5F5', 100: '#F7D6D0', 200: '#E2B4BD', 300: '#D89FAA', 400: '#800020', 500: '#800020', 600: '#800020', 700: '#800020', 900: '#3A2029' },
        surface: '#F7D6D0',
        primary: { 500: '#800020', 600: '#800020' },
        white: '#FFF5F5',
        gray: { 50: '#FFF5F5', 100: '#F7D6D0', 200: '#E2B4BD', 300: '#D89FAA', 400: '#8E626C', 500: '#70464F', 600: '#52313A', 700: '#3A2029', 800: '#3A2029', 900: '#3A2029' },
      },
      boxShadow: { soft: '0 20px 60px rgba(58, 32, 41, 0.10), 0 2px 8px rgba(58, 32, 41, 0.06)' },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

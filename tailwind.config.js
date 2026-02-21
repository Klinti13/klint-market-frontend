/** @type {import('tailwindcss').Config} */
export default {
  // 🛑 MAGJIA KËTU: Kjo rresht e bën që Dark Mode të kontrollohet nga ne, jo nga kompjuteri!
  darkMode: 'class', 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
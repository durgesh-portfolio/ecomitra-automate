/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./insertData/templates/**/*.html",
    "./insertData/static/**/*.js",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#4e73df',
        success: '#1cc88a',
        warning: '#f6c23e',
        dark: {
          DEFAULT: '#1a1d21',
          card: '#2d3338'
        }
      }
    }
  },
  plugins: [],
}

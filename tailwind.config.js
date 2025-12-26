/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mriya: {
          dark: '#0a0e17', // Основний темний фон
          cyan: '#00d4ff', // Світіння та акценти (Swap)
          gold: '#f0dfae', // Кнопка та акценти
          glass: 'rgba(255, 255, 255, 0.05)', // Колір скла
          border: 'rgba(255, 255, 255, 0.1)', // Тонкі рамки
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Сучасний шрифт
      },
      backgroundImage: {
        'main-gradient': 'radial-gradient(circle at 50% 50%, #1a2c38 0%, #0a0e17 100%)',
      }
    },
  },
  plugins: [],
}
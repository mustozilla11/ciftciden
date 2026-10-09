/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./utils/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Çiftçiden Doğal Tarım Paleti
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d', // Zümrüt Yeşili
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Toprak / Hasat Tonları
        earth: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Acil Durum / Tazelik Uyarısı (Güneşte yüksek kontrast)
        urgency: {
          badge: '#ea580c',
          bg: '#ffedd5',
          text: '#9a3412',
          border: '#fdba74',
        },
        fresh: {
          badge: '#15803d',
          bg: '#dcfce7',
          text: '#14532d',
          border: '#86efac',
        }
      },
    },
  },
  plugins: [],
};

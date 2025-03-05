/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-red': '#CC0000', // Définir la couleur personnalisée rouge
        'custom-gray': '#333', // Définir la couleur personnalisée gris foncé
      },
    },
  },
  plugins: [],
}

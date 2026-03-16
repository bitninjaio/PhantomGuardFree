/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wp-blue': '#0073aa',
        'wp-light-blue': '#00a0d2',
        'wp-gray': '#f1f1f1',
        'wp-dark-gray': '#23282d',
        'wp-red': '#dc3232',
        'wp-green': '#46b450',
        'wp-orange': '#ffb900'
      }
    },
  },
  plugins: [],
}




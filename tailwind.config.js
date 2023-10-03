/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
    },
    fontFamily: {
      'berkshire': ['berkshire swash', 'sans-serif'],
      'aladin': ['"aladin"', 'sans-serif'] // Ensure fonts with spaces have " " surrounding it.
    },
    backgroundImage: {
      "skyscrapers": "url('images/Building-cuate.svg')",
    }
  },
  plugins: [],
}


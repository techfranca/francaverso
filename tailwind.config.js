/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'franca-green': '#7DE08D',
        'franca-green-light': '#f2fcf4',
        'franca-green-hover': '#71ca7f',
        'franca-green-dark': '#598F74',
        'franca-blue': '#081534',
        'franca-blue-light': '#e6e8eb',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#ced9fd',
          300: '#adc0fb',
          400: '#8da7f9',
          500: '#6d8ef7',
          600: '#5a76ce',
          700: '#485ea5',
          800: '#36477b',
          900: '#242f52',
        },
      },
    },
  },
  plugins: [],
}

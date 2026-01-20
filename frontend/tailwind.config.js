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
        primary: {
          50: '#e8f5fe',
          100: '#d1ebfd',
          200: '#a3d7fb',
          300: '#75c3f9',
          400: '#47aff7',
          500: '#1d9bf0',
          600: '#1a8cd8',
          700: '#177dc0',
          800: '#146ea8',
          900: '#115f90',
        },
      },
      keyframes: {
        loading: {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(250%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [],
}

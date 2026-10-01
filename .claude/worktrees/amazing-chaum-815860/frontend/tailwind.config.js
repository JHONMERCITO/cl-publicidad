/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Naranja Big Arte (color dominante del logo)
        primary: {
          50:  '#FFF8F0',
          100: '#FFEFD9',
          200: '#FFD9A8',
          300: '#FFBE6F',
          400: '#FFA040',
          500: '#F5901E',
          600: '#E07A0A',
          700: '#B86108',
          800: '#924D06',
          900: '#703B05',
        },
        // Teal Big Arte (color de la "A" del logo)
        secondary: {
          50:  '#E6F7F7',
          100: '#CCEFEE',
          200: '#99DFDE',
          300: '#66CFCD',
          400: '#33BFBC',
          500: '#009E9A',
          600: '#007E7B',
          700: '#005F5C',
          800: '#003F3D',
          900: '#002020',
        },
        success: {
          500: '#10b981',
        },
        warning: {
          500: '#f59e0b',
        },
        danger: {
          500: '#ef4444',
        }
      }
    },
  },
  plugins: [],
}

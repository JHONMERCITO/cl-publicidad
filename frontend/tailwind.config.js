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
        // Rojo CL Publicidad (C exterior del logo)
        primary: {
          50:  '#FEF2F2',
          100: '#FDE8E8',
          200: '#FBBDBD',
          300: '#F89292',
          400: '#F56C6C',
          500: '#C0202A',
          600: '#A01520',
          700: '#820F18',
          800: '#650B13',
          900: '#48080E',
        },
        // Azul acero CL Publicidad (L interior del logo)
        secondary: {
          50:  '#EBF2F8',
          100: '#D6E5F1',
          200: '#ADCBE3',
          300: '#84B1D5',
          400: '#5B97C7',
          500: '#2C6DA0',
          600: '#245A85',
          700: '#1C476A',
          800: '#143450',
          900: '#0C2235',
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

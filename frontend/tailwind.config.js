/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Be Vietnam Pro"', 'sans-serif'],
        sans: ['"Be Vietnam Pro"', 'sans-serif'],
        serif: ['"Be Vietnam Pro"', 'sans-serif'],
        inter: ['"Be Vietnam Pro"', 'sans-serif'],
        display: ['"Be Vietnam Pro"', 'sans-serif']
      },
      colors: {
        purple: { 50: '#F8F4EB', 100: '#F1EBE2', 200: '#E4D8C3', 300: '#D2BE96', 400: '#B79C68', 500: '#8A6D39', 600: '#523F2B', 700: '#463522', 800: '#3E2F20', 900: '#2B2B2B', 950: '#1A1A1A' },
        brand: {
          50: '#F8F4EB',
          100: '#F1EBE2',
          200: '#DDD3C5',
          300: '#D2BE96',
          400: '#B79C68',
          500: '#8A6D39',
          600: '#523F2B',
          700: '#3E2F20',
          800: '#3E2F20',
          900: '#2B2B2B',
          purple: '#523F2B'
        },
        surface: {
          page: '#FDFBF7',
          card: '#FFFFFF',
          ink: '#1A1A1A',
          muted: '#6B6258',
          slate: '#6B7280',
          border: '#DDD3C5',
          light: '#FDFBF7',
          container: '#F1EBE2'
        },
        jade: {
          DEFAULT: '#10B981',
          50: '#ecfdf5',
          500: '#10B981',
          600: '#059669'
        },
        giftory: {
          primary: {
            DEFAULT: '#523F2B',
            dark: '#3E2F20',
            light: '#DDD3C5'
          },
          sale: {
            DEFAULT: '#E11D48',
            hover: '#BE123C'
          },
          amber: '#F59E0B',
          emerald: '#10B981',
          ink: '#1A1A1A',
          canvas: '#FDFBF7',
          surface: '#FDFBF7',
          border: '#DDD3C5'
        }
      },
      boxShadow: {
        'shop-card': '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 4px 10px -2px rgba(0, 0, 0, 0.02)',
        'floating': '0 20px 40px -10px rgba(15, 23, 42, 0.12)',
        'pill': '0 4px 20px -2px rgba(0, 0, 0, 0.06)',
        'admin-card': '0 10px 25px -5px rgba(124, 58, 237, 0.08)'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}

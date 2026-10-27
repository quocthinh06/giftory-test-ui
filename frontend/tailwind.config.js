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
        purple: { 50: '#FAF1ED', 100: '#F2E3DC', 200: '#E5C9BE', 300: '#CFA599', 400: '#B78076', 500: '#985C60', 600: '#800020', 700: '#70001C', 800: '#66001A', 900: '#391720', 950: '#2B111A' },
        brand: {
          50: '#FAF1ED',
          100: '#F2E8DD',
          200: '#DCCAB1',
          300: '#CFA599',
          400: '#B78076',
          500: '#985C60',
          600: '#800020',
          700: '#66001A',
          800: '#66001A',
          900: '#391720',
          purple: '#800020'
        },
        surface: {
          page: '#FFF5E1',
          card: '#FFFFFF',
          ink: '#3D2926',
          muted: '#75635A',
          slate: '#6B7280',
          border: '#DCCAB1',
          light: '#FFF5E1',
          container: '#F2E8DD'
        },
        jade: {
          DEFAULT: '#10B981',
          50: '#ecfdf5',
          500: '#10B981',
          600: '#059669'
        },
        giftory: {
          primary: {
            DEFAULT: '#800020',
            dark: '#66001A',
            light: '#DCCAB1'
          },
          sale: {
            DEFAULT: '#E11D48',
            hover: '#BE123C'
          },
          amber: '#F59E0B',
          emerald: '#10B981',
          ink: '#3D2926',
          canvas: '#FFF5E1',
          surface: '#FFF5E1',
          border: '#DCCAB1'
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

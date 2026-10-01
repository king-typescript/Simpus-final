/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0B2447',
          900: '#0F2A52',
          800: '#123B6B',
          700: '#154684',
        },
        brand: {
          DEFAULT: '#1D5FAE',
          light: '#3B82D6',
          soft: '#EAF3FC',
        },
        teal: {
          accent: '#14B8A6',
        },
        slate: {
          copy: '#5B6B82',
        },
        'primary-blue': '#0879E5',
        'dark-navy': '#102E68',
        'light-blue': '#EAF4FF',
        'bg-color': '#FFFFFF',
        'text-utama': '#102E68',
        'text-sekunder': '#60759A',
        'accent': '#1098A6',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        poppins: ['"Poppins"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 24px -12px rgba(15, 42, 82, 0.18)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}

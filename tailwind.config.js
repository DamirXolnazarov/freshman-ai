/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Foundation — deep navy, used for the sidebar, dark surfaces, strong anchors
        navy: {
          950: '#0A1220',
          900: '#0F1B30',
          800: '#16243D',
          700: '#1E3050',
          600: '#2B4267',
          500: '#3E5883',
        },
        // Primary light surface — warm ivory/paper, never pure white
        parchment: {
          50: '#FDFBF6',
          100: '#FAF5EA',
          200: '#F3EBD8',
          300: '#E9DCBF',
        },
        // Restrained gold — accents, AI identity, premium moments only
        gold: {
          300: '#E6CD98',
          400: '#D2AF6B',
          500: '#BC934C',
          600: '#93713A',
        },
        // Soft blue — secondary accent, progress, links, selected states
        skyline: {
          300: '#B7C7E0',
          400: '#93AAD0',
          500: '#6E88B8',
          600: '#516A9A',
        },
        // Muted secondary tones, used sparingly
        sage: '#8CA089',
        dusty: '#C79E9E',
        sand: '#D9C6A0',
        // Text
        ink: {
          900: '#171E2C',
          700: '#333F55',
          500: '#5B6880',
        },
      },
      fontFamily: {
        // Display serif — headings, quotes, brand moments
        serif: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        // Utility sans — navigation, labels, data, buttons
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '18px',
        control: '12px',
      },
      boxShadow: {
        panel: '0 1px 2px rgba(23, 30, 44, 0.04), 0 8px 24px -12px rgba(23, 30, 44, 0.12)',
        raised: '0 2px 4px rgba(23, 30, 44, 0.06), 0 16px 40px -16px rgba(23, 30, 44, 0.22)',
        gold: '0 6px 20px -8px rgba(188, 147, 76, 0.45)',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        'brick-rise': {
          '0%': { opacity: '0', transform: 'translateY(6px) scale(0.92)' },
          '60%': { opacity: '1', transform: 'translateY(-1px) scale(1.02)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'brick-rise': 'brick-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-up': 'fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        'glow-pulse': 'glow-pulse 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

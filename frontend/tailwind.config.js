/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0f766e',
          deep: '#115e59',
          soft: '#ccfbf1'
        },
        accent: {
          DEFAULT: '#f59e0b',
          soft: '#fef3c7'
        },
        clay: '#f4efe8',
        ink: '#122029'
      },
      boxShadow: {
        card: '0 22px 60px rgba(15, 23, 42, 0.10)'
      },
      borderRadius: {
        app: '1.75rem'
      }
    }
  },
  plugins: []
};

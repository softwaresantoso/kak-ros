/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#D95A2A',      // primary — terracotta-orange, product brand (not tied to any one tenant restaurant)
          redDark: '#B8441B',
          cream: '#FFF8F0',    // background
          dark: '#1C1917'      // near-black text / dark surfaces (kitchen mode)
        },
        status: {
          pending: '#F59E0B',
          confirmed: '#3B82F6',
          processing: '#8B5CF6',
          ready: '#10B981',
          completed: '#6B7280',
          cancelled: '#EF4444'
        }
      },
      borderRadius: {
        card: '1rem'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};

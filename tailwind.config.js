/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0a0f1c',
          800: '#0f1629',
          700: '#151d35',
          600: '#1a2440',
          500: '#1e2a4a',
        },
        accent: {
          purple: '#6366f1',
          pink: '#ec4899',
          blue: '#3b82f6',
        }
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #6366f1, #ec4899)',
        'gradient-brand-hover': 'linear-gradient(135deg, #818cf8, #f472b6)',
        'gradient-surface': 'linear-gradient(180deg, #0f1629 0%, #0a0f1c 100%)',
      }
    },
  },
  plugins: [],
}

import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'luminous': {
          'white': '#FBFBFD',
          'glass': 'rgba(255, 255, 255, 0.7)',
          'ice': '#E2E2E2',
          'ink': '#1D1D1F',
          'blue': '#007AFF',
          'gold': '#D4AF37',
        }
      },
      animation: {
        'fade-in-slow': 'fadeIn 1.2s ease-out forwards',
        'prism-shimmer': 'prism 8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        prism: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        }
      }
    },
  },
  plugins: [
    tailwindcssAnimate,
  ],
}

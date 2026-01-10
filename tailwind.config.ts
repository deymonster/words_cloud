import type { Config } from 'tailwindcss'

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5C7AEA',
          dark: '#4054C7'
        }
      },
      animation: {
        spinSlow: 'spin 20s linear infinite'
      }
    },
  },
  plugins: [],
} satisfies Config


/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        chat: {
          bg: '#0b1320',
          sidebar: '#111b21',
          header: '#202c33',
          input: '#2a3942',
          sent: '#005c4b',
          received: '#202c33',
          hover: '#2a3942',
          border: '#3b4a54',
          text: '#e9edef',
          secondary: '#8696a0',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

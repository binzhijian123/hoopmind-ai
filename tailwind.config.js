/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Arial Narrow"', '"Microsoft YaHei"', 'sans-serif'],
        body: ['"Microsoft YaHei"', 'sans-serif'],
      },
      colors: {
        ink: '#07090d',
        court: '#1b3a2f',
        line: '#f8ead4',
        rim: '#f97316',
      },
      boxShadow: {
        glow: '0 0 28px rgba(249, 115, 22, 0.22)',
      },
    },
  },
  plugins: [],
}

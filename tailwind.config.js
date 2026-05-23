/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: '#004B23',
        green: '#008000',
        growth: '#38B000',
        dark: '#1a1a1a',
        muted: '#555555',
        light: '#F5F5F5',
      },
    },
  },
  plugins: [],
}


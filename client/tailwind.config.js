/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
    safelist: [
    'w-56',
    'w-0',
    'ml-56',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
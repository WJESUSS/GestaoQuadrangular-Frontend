/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ieq: {
          red: "#e20613",
          yellow: "#ffcc00",
          blue: "#005ca9",
          purple: "#662d91",
          dark: "#0f172a",
          light: "#f8fafc"
        }
      }
    }
  },
  plugins: [],
};
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1E40AF",
        secondary: "#0891B2",
        dark: "#334155",
        accent: "#EA580C",
        success: "#059669",
        white: "#F8FAFC",
        one: "#eff3ff",
        two: "#dbe3fe",
        three: "#bfcefe",
        four: "#93acfd",
        five: "#6084fa",
        six: "#3b67f6",
        seven: "#2553eb",
        background: "#B57EDC",
        buttons: "#3B82F6",
        highlights: "#9CA986",
      },
      fontFamily: {
        Quizzard: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};

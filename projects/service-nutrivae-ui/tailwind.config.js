/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211f",
        muted: "#6b7774",
        canvas: "#f5f7f6",
        line: "#e3e8e6",
        brand: {
          50: "#edf8f5",
          100: "#d5eee7",
          500: "#3d8f7f",
          600: "#30776b",
          700: "#285f57",
          900: "#193e39"
        },
        coral: "#ef7f68",
        butter: "#f4d98a"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Manrope", "Inter", "sans-serif"]
      },
      boxShadow: {
        card: "0 1px 2px rgba(23,33,31,.03), 0 8px 24px rgba(23,33,31,.04)",
        float: "0 16px 40px rgba(23,33,31,.12)"
      }
    }
  },
  plugins: []
};

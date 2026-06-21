/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        base: {
          100: "var(--color-base-100)",
          200: "var(--color-base-200)",
          300: "var(--color-base-300)",
          content: "var(--color-base-content)"
        },
        primary: "var(--color-primary)",
        "primary-content": "var(--color-primary-content)",
        secondary: "var(--color-secondary)",
        "secondary-content": "var(--color-secondary-content)",
        accent: "var(--color-accent)",
        "accent-content": "var(--color-accent-content)",
        neutral: "var(--color-neutral)",
        "neutral-content": "var(--color-neutral-content)",
        info: "var(--color-info)",
        "info-content": "var(--color-info-content)",
        success: "var(--color-success)",
        "success-content": "var(--color-success-content)",
        warning: "var(--color-warning)",
        "warning-content": "var(--color-warning-content)",
        error: "var(--color-error)",
        "error-content": "var(--color-error-content)",
        ink: "var(--color-base-content)",
        muted: "var(--color-muted)",
        canvas: "var(--color-base-200)",
        line: "var(--color-base-300)",
        brand: {
          50: "var(--color-primary-soft)",
          100: "var(--color-primary-soft-strong)",
          500: "var(--color-primary)",
          600: "var(--color-primary)",
          700: "var(--color-neutral)",
          900: "var(--color-neutral)"
        },
        coral: "var(--color-error)",
        butter: "var(--color-primary)"
      },
      borderRadius: {
        selector: "var(--radius-selector)",
        field: "var(--radius-field)",
        box: "var(--radius-box)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Manrope", "Inter", "sans-serif"]
      },
      boxShadow: {
        card: "var(--shadow-card)",
        float: "var(--shadow-modal)"
      }
    }
  },
  plugins: []
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["index.html", "src/**/*.{js,ts,jsx,tsx,html,css}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        // BlockBlast design system colors
        app: {
          // Background colors
          bg: {
            primary: "#F8F9FA",
            secondary: "#F1F3F5",
            tertiary: "#E9ECEF",
          },
          // Surface colors
          surface: {
            DEFAULT: "#FFFFFF",
            hover: "#F8F9FA",
            active: "#EFF6FF",
          },
          // Border colors
          border: {
            DEFAULT: "#E5E7EB",
            light: "#F3F4F6",
            dark: "#D1D5DB",
          },
          // Text colors
          text: {
            primary: "#1A1A1A",
            secondary: "#6B7280",
            tertiary: "#9CA3AF",
            inverse: "#FFFFFF",
          },
          // Accent colors (blue)
          accent: {
            50: "#EFF6FF",
            100: "#DBEAFE",
            200: "#BFDBFE",
            300: "#93C5FD",
            400: "#60A5FA",
            500: "#3B82F6",
            600: "#2563EB",
            700: "#1D4ED8",
            800: "#1E40AF",
            900: "#1E3A8A",
          },
        },
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        "card-hover":
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        modal: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "../../packages/shared/src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        surface: {
          50: "#fbf8f4",
          100: "#f2ebe1",
          200: "#e8dccd",
          300: "#d7c2ab",
          400: "#c5a27e",
          500: "#af8458",
          600: "#94673f",
          700: "#785136",
          800: "#624330",
          900: "#533a2b"
        },
        herb: {
          50: "#f3f8ef",
          100: "#e4eedb",
          200: "#cadabe",
          300: "#aac393",
          400: "#89aa67",
          500: "#6c8c4b",
          600: "#56713b",
          700: "#435730",
          800: "#384629",
          900: "#303c25"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"]
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem"
      },
      boxShadow: {
        panel: "0 24px 80px rgba(21, 18, 13, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  presets: [require("nativewind/preset")],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "../../packages/shared/src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
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
      }
    }
  },
  plugins: []
};

export default config;

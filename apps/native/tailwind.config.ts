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
        budcast: {
          canvas: "#070806",
          surface: "#10120f",
          raised: "#151714",
          overlay: "#1a1b16",
          line: "rgba(255,255,255,0.1)",
          text: "#fbf8f4",
          muted: "#a59a86",
          subtle: "#6f7468",
          lime: "#b8ff3d",
          limeSoft: "rgba(184,255,61,0.12)",
          success: "#8ee68e",
          warning: "#f0b85c",
          danger: "#ff6b4a",
          trust: "#69d8d0",
          premium: "#d7b46a"
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
      borderRadius: {
        surface: "20px",
        raised: "24px",
        pill: "999px"
      },
      spacing: {
        safe: "20px"
      }
    }
  },
  plugins: []
};

export default config;

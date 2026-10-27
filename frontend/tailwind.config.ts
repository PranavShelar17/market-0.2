import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./i18n/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        soil: {
          dark: "#153928",
          darkHover: "#1b4632",
          darkActive: "#527961",
          sage: "#557e63",
          sageLight: "#e5f0e8",
          cream: "#FAF7F2",
          creamDark: "#F2ECE1",
          paper: "#F7F4EE",
          primary: "#2A7C13",
          primaryHover: "#23660f",
          primaryLight: "#e9f6e5",
          secondary: "#76C457",
          secondaryHover: "#62a845",
          beige: "#FBE6C2",
          beigeDark: "#e8cba0",
        },
        surface: {
          DEFAULT: "#ffffff",
          subtle: "#FAF7F2",
          muted: "#F4EFE6",
          border: "#E8E2D8",
          borderStrong: "#D6CCC0",
        },
        text: {
          main: "#163828",
          muted: "#5C6E61",
          light: "#829487",
          inverted: "#ffffff",
        }
      },
      fontFamily: {
        serif: [
          "'Playfair Display'",
          "Georgia",
          "Cambria",
          "'Times New Roman'",
          "serif",
        ],
        sans: [
          "'Plus Jakarta Sans'",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(42, 124, 19, 0.08), 0 1px 2px rgba(0,0,0,0.04)",
        card: "0 4px 12px rgba(42, 124, 19, 0.06), 0 1px 3px rgba(0,0,0,0.04)",
        hover: "0 8px 24px rgba(42, 124, 19, 0.12), 0 2px 6px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;

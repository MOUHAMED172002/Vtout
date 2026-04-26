// Updated Tailwind + DaisyUI config (dark mode removed, single custom light theme)
import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Enable dark mode support (class based for better control)
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f97316',
          focus: '#ea580c',
        },
      },
      // ... common extensions
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        vtout: {
          "primary": "#f97316",
          "secondary": "#fbbf24",
          "accent": "#22c55e",
          "neutral": "#1e293b",
          "base-100": "#ffffff",
          "info": "#3b82f6",
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#ef4444",
        },
      },
      "light",
      "dark",
      "cupcake",
      "synthwave",
      "cyberpunk",
      "luxury",
      "dracula",
      "emerald",
      "corporate",
      "retro",
      "valentine"
    ],
  },
};
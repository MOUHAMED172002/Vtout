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
    themes: ["light", "dark", "retro", "valentine"],
  },
};
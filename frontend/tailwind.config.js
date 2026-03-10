// Updated Tailwind + DaisyUI config (dark mode removed, single custom light theme)
import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // darkMode removed as requested
  theme: {
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        }
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    styled: true,
    // Single light theme only (no dark theme)
    themes: [
      
      "dark",
      "cupcake",
    ],
    base: true,
    utils: true,
    logs: true,
    rtl: false,
  },
};
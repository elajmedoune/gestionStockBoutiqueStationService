/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      "cupcake", "lemonade", "light", "dark", "bumblebee", "emerald", "corporate",
      "synthwave", "retro", "cyberpunk", "valentine", "halloween",
      "garden", "forest", "aqua", "lofi", "pastel", "fantasy",
      "wireframe", "black", "luxury", "dracula", "cmyk", "autumn",
      "business", "acid", "night", "coffee", "winter",
      {
        x: {
          "primary":           "#1d9bf0",
          "primary-content":   "#ffffff",
          "secondary":         "#16181c",
          "secondary-content": "#e7e9ea",
          "accent":            "#1d9bf0",
          "accent-content":    "#ffffff",
          "neutral":           "#2f3336",
          "neutral-content":   "#e7e9ea",
          "base-100":          "#000000",
          "base-200":          "#16181c",
          "base-300":          "#1c1f23",
          "base-content":      "#e7e9ea",
          "info":              "#1d9bf0",
          "success":           "#00ba7c",
          "warning":           "#ffd400",
          "error":             "#f4212e",
        },
      },

      {
        elegance: {
          "primary":           "#111111",
          "primary-content":   "#ffffff",
          "secondary":         "#444444",
          "secondary-content": "#ffffff",
          "accent":            "#c9a84c",
          "accent-content":    "#000000",
          "neutral":           "#222222",
          "neutral-content":   "#f5f5f5",
          "base-100":          "#ffffff",
          "base-200":          "#f8f8f8",
          "base-300":          "#eeeeee",
          "base-content":      "#111111",
          "info":              "#3b82f6",
          "success":           "#16a34a",
          "warning":           "#c9a84c",
          "error":             "#dc2626",
        },
      },
    ],
  },
}
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
    themes: [ "cupcake", "lemonade", "light", "dark", "bumblebee", "emerald", "corporate",
             "synthwave", "retro", "cyberpunk", "valentine", "halloween",
             "garden", "forest", "aqua", "lofi", "pastel", "fantasy",
             "wireframe", "black", "luxury", "dracula", "cmyk", "autumn",
             "business", "acid", "night", "coffee", "winter"],
  },
}
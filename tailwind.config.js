/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./build/**/*{.html, js}"],
  theme: {
    extend: {
      screens: {
        widescreen: { raw: "(min-aspect-ratio: 3/2)" },
        tallscreen: { raw: "(max-aspect-ratio: 13/20)" },
      },
      backgroundImage: {
        postcardv1: "url('/images/PostcardV6.jpg')",
      },
      fontFamily: {
        roboto: "Roboto, sans-serif",
        jost: "Jost, sans-serif",
        // Adds a new `font-display` class
      },
      colors: {
        greendark: "#2C541D",
        greenlight: "#74A84A",
      },
      height: {
        420: "420px",
        600: "600px",
        500: "500px",
        "max-600": "600px",
      },
      padding: {
        "350px": "350px",
        "500px": "500px",
        "600px": "600px",
      },

      keyframes: {
        "open-menu": {
          "0%": { transform: "scaleY(0)" },
          "80%": { transform: "scaleY(1.2)" },
          "100%": { transform: "scaleY(1)" },
        },

        "open-sidebar": {
          "0%": { transform: "translateX(100%)" },

          "100%": { transform: "translateX(1%)" },
        },
        "close-sidebar": {
          "0%": { transform: "translateX(1%)" },

          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "open-menu": "open-menu 0.65s ease-in-out forwards",
        "open-sidebar": "open-sidebar 0.2s ease-in forwards",
        "close-sidebar": "close-sidebar 0.5s ease-in-out backwards",
      },
    },
  },
  plugins: [],
};

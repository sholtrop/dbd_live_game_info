module.exports = {
  purge: ["./src/**/*.css", "./src/**/*.tsx"],
  theme: {
    extend: {
      backgroundColor: {
        "light-up": "rgba(255, 255, 255, 0.1);",
      },
    },
  },
  variants: {
    transform: ["group-hover", "hover", "responsive"],
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html"],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      borderRadius: {
        sm: "2rem",
      },
    },
  },
  plugins: [],
};

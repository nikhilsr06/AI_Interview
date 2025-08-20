/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        danger: "#EF4444", // Tailwind red-500
        warning: "#F59E0B", // Tailwind yellow-500
        info: "#3B82F6", // Tailwind blue-500
        primary: "#6366F1", // Tailwind indigo-500
        secondary: "#6B7280", // Tailwind gray-500
      },
    },
  },
  plugins: [],
};

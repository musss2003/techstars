// vite.config.js (or .ts)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path"; // <--- Import 'path'
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      // <--- ADD THIS resolve block
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

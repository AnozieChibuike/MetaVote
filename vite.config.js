import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "tailwindcss";
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Directs any local request starting with /api to your EC2
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        // If your Flask backend doesn't expect the "/api" prefix,
        // this line removes it before the request hits Flask:
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});

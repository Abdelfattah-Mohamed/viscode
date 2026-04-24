import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": "/src" },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const moduleId = id.replace(/\\/g, "/");

          if (moduleId.includes("/node_modules/react/") || moduleId.includes("/node_modules/react-dom/")) {
            return "vendor";
          }
          if (moduleId.includes("/node_modules/")) {
            return "vendor-misc";
          }

          if (moduleId.includes("/src/data/problems.js")) {
            return "problems-data";
          }
          if (moduleId.includes("/src/data/stepGenerators.js")) {
            return "step-generators";
          }
          if (moduleId.includes("/src/components/visualizers/")) {
            return "visualizers";
          }
          if (moduleId.includes("/src/pages/AppPage.jsx")) {
            return "app-workspace";
          }
        },
      },
    },
  },
});

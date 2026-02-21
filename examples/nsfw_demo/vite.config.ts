import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    preserveSymlinks: true,
    dedupe: [
      "nsfwjs",
      "@tensorflow/tfjs",
      "@tensorflow/tfjs-core",
      "@tensorflow/tfjs-backend-cpu",
      "@tensorflow/tfjs-backend-webgl",
      "@tensorflow/tfjs-backend-webgpu",
    ],
  },
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    tailwindcss(),
  ],
  worker: {
    format: "es", // FIXME: https://github.com/vitejs/vite/issues/18585
  },
});

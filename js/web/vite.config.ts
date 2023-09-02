import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
    build: { target: "ESNext" },
    plugins: [react()],
    envDir: resolve(__dirname, "../.."),
});

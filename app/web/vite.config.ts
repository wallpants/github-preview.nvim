import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
    // eslint-disable-next-line
    plugins: [react() as any],
    define: {
        __HOST__: JSON.stringify("localhost"),
        __PORT__: JSON.stringify(6041),
        __IS_DEV__: JSON.stringify(true),
        __THEME__: JSON.stringify({ name: "system", high_contrast: true }),
    },
    server: {
        proxy: {
            // redirect these requests to bun server instead of vite server
            "^/__github_preview__/.*": {
                target: "http://localhost:6041",
                changeOrigin: true,
            },
        },
    },
});

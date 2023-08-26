/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./nodejs/client/**/*.{html,ts,tsx}"],
    theme: {
        extend: {},
        colors: {
            fg: {
                default: "var(--color-fg-default)",
                muted: "var(--color-fg-muted)",
                subtle: "var(--color-fg-subtle)",
            },
            canvas: {
                default: "var(--color-canvas-default)",
                subtle: "var(--color-canvas-subtle)",
            },
            border: {
                default: "var(--color-border-default)",
                muted: "var(--color-border-muted)",
            },
            neutral: {
                muted: "var(--color-neutral-muted)",
            },
            accent: {
                fg: "var(--color-accent-fg)",
            },
            attention: {
                subtle: "var(--color-attention-subtle)",
            },
            icon: {
                directory: "var(--color-icon-directory)",
                file: "var(--color-icon-file)",
            },
        },
    },
    plugins: [],
};

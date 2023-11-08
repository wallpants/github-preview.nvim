/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./**/*.{html,tsx}"],
    corePlugins: {
        preflight: false,
    },
    theme: {
        colors: ({ colors }) => ({
            red: colors.red,
            orange: colors.orange,
            green: colors.green,
            gray: colors.gray,
            white: colors.white,
            transparent: colors.transparent,
            github: {
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
                    muted: "var(--color-attention-muted)",
                },
                icon: {
                    directory: "var(--color-icon-directory)",
                    file: "var(--color-icon-file)",
                },
            },
        }),
    },
    plugins: [],
};

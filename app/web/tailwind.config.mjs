/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./**/*.{html,tsx}"],
    corePlugins: {
        preflight: false,
    },
    theme: {
        colors: ({ colors }) => ({
            orange: colors.orange,
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
                    emphasis: "var(--color-accent-emphasis)",
                },
                attention: {
                    fg: "var(--color-attention-fg)",
                    subtle: "var(--color-attention-subtle)",
                    muted: "var(--color-attention-muted)",
                },
                danger: {
                    fg: "var(--color-danger-fg)",
                },
                success: {
                    fg: "var(--color-success-fg)",
                },
                done: {
                    fg: "var(--color-done-fg)",
                },
                icon: {
                    directory: "var(--color-icon-directory)",
                    file: "var(--color-icon-file)",
                },
                btn: {
                    bg: "var(--color-btn-bg)",
                    border: "var(--color-btn-border)",
                    hover: {
                        bg: "var(--color-btn-hover-bg)",
                    },
                },
            },
        }),
    },
    plugins: [],
};

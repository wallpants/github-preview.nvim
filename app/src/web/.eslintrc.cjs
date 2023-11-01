/** @type {import('eslint').ESLint.Options} */
module.exports = {
    env: { browser: true },
    ignorePatterns: [".eslintrc.cjs", "*.min.js"],
    plugins: ["react-refresh"],
    extends: ["plugin:react-hooks/recommended", "plugin:tailwindcss/recommended"],
    settings: {
        tailwindcss: {
            config: __dirname + "/tailwind.config.cjs",
        },
    },
    rules: {
        "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
        "tailwindcss/no-custom-classname": [
            "warn",
            {
                whitelist: ["pantsdown", "dark"],
            },
        ],
    },
};

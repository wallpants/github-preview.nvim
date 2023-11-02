/** @type {import('eslint').ESLint.Options} */
module.exports = {
    env: { browser: true },
    ignorePatterns: [".eslintrc.cjs", "*.min.js"],
    extends: ["plugin:react-hooks/recommended", "plugin:tailwindcss/recommended"],
    settings: {
        tailwindcss: {
            config: __dirname + "/tailwind.config.cjs",
        },
    },
    rules: {
        "tailwindcss/no-custom-classname": [
            "warn",
            {
                whitelist: ["pantsdown", "dark"],
            },
        ],
    },
};

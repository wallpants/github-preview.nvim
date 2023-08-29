/** @type {import("eslint").Linter.Config} */
const config = {
    env: { browser: true },
    extends: [
        "plugin:tailwindcss/recommended",
        "plugin:react-hooks/recommended",
    ],
    plugins: ["react-refresh"],
    // cspell:ignore callees
    settings: { tailwindcss: { callees: ["cn"] } },
    rules: {
        "react-refresh/only-export-components": [
            "warn",
            { allowConstantExport: true },
        ],
    },
};

module.exports = config;

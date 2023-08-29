/** @type {import("eslint").Linter.Config} */
const config = {
    root: true,
    env: { browser: true, es2020: true },
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "./tsconfig.json",
    },
    extends: [
        "eslint:recommended",
        "plugin:tailwindcss/recommended",
        "plugin:react-hooks/recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-type-checked",
    ],
    plugins: ["react-refresh", "tsdoc", "import"],
    settings: {
        tailwindcss: {
            callees: ["cn"],
        },
    },
    ignorePatterns: ["dist", ".eslintrc.cjs"],
    rules: {
        "react-refresh/only-export-components": [
            "warn",
            { allowConstantExport: true },
        ],
        "@typescript-eslint/no-unused-vars": [
            "error",
            { argsIgnorePattern: "^_" },
        ],
        "@typescript-eslint/consistent-type-imports": [
            "warn",
            { prefer: "type-imports", fixStyle: "inline-type-imports" },
        ],
        "@typescript-eslint/no-misused-promises": ["off"],
    },
};

module.exports = config;

/** @type {import("eslint").Linter.Config} */
const config = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.json"],
    },
    extends: ["plugin:@typescript-eslint/recommended-type-checked"],
    rules: {
        "@typescript-eslint/no-unused-vars": [
            "error",
            {
                argsIgnorePattern: "^_",
            },
        ],
        "@typescript-eslint/consistent-type-imports": [
            "warn",
            {
                prefer: "type-imports",
                fixStyle: "inline-type-imports",
            },
        ],
        "@typescript-eslint/no-misused-promises": ["off"],
    },
};

module.exports = config;

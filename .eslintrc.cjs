/** @type {import("eslint").Linter.Config} */
const config = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
            "./nodejs/web/tsconfig.json",
            "./nodejs/server/tsconfig.json",
        ],
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-type-checked",
    ],
    plugins: ["eslint-plugin-tsdoc", "import"],
    ignorePatterns: ["dist", ".eslintrc.cjs"],
    rules: {
        "tsdoc/syntax": "warn",
        "@typescript-eslint/no-unused-vars": [
            "error",
            { argsIgnorePattern: "^_" },
        ],
        "@typescript-eslint/consistent-type-imports": [
            "warn",
            { prefer: "type-imports", fixStyle: "inline-type-imports" },
        ],
    },
};

module.exports = config;

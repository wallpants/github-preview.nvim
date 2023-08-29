// cspell:disable
/** @type {import("eslint").Linter.Config} */
const config = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        tsconfigRootDir: __dirname,
        project: [
            "./nodejs/web/tsconfig.json",
            "./nodejs/web/tsconfig.node.json",
            "./nodejs/server/tsconfig.json",
        ],
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/strict-type-checked",
        "plugin:@typescript-eslint/stylistic-type-checked",
    ],
    plugins: ["eslint-plugin-tsdoc", "import"],
    ignorePatterns: ["dist", ".eslintrc.cjs"],
    rules: {
        "tsdoc/syntax": "warn",
        "@typescript-eslint/no-misused-promises": [
            "error",
            { checksVoidReturn: false },
        ],
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

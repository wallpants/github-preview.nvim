module.exports = {
    env: { browser: true, es2020: true },
    extends: [
        "plugin:react-hooks/recommended",
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
    ],
    settings: {
        react: { version: "detect" },
    },
    plugins: ["react-refresh"],
    ignorePatterns: [
        "dist",
        ".eslintrc.cjs",
        "postcss.config.cjs",
        "prettier.config.cjs",
    ],
    rules: {
        "react-refresh/only-export-components": [
            "warn",
            { allowConstantExport: true },
        ],
    },
};

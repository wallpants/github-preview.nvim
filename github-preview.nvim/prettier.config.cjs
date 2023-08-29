/** @type import("prettier").Config */
const config = {
    tabWidth: 4,
    plugins: ["prettier-plugin-organize-imports"],
    overrides: [
        {
            files: ["*.json"],
            options: {
                tabWidth: 2,
            },
        },
    ],
};

module.exports = config;

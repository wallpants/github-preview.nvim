export const ENV = {
    LOG_LEVEL: process.env["LOG_LEVEL"],
    IS_DEV: Boolean(process.env["IS_DEV"]),

    // nvim sets its listen address in child processes
    NVIM: process.env["NVIM"],
};

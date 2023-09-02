export const ENV = {
    GP_IS_DEV: process.env["GP_IS_DEV"],
    VITE_GP_PORT: process.env["VITE_GP_PORT"],

    // logs
    LOG_LEVEL: process.env["LOG_LEVEL"],
    SERVER_LOG_STREAM: process.env["SERVER_LOG_STREAM"],
    BRIDGE_LOG_STREAM: process.env["BRIDGE_LOG_STREAM"],

    // nvim sets its listen address in child processes
    NVIM: process.env["NVIM"],
};

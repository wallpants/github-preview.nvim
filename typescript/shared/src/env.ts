const VITE_GP_WS_PORT = process.env["VITE_GP_WS_PORT"];

export const ENV = {
    VITE_GP_WS_PORT,
    IS_DEV: Boolean(VITE_GP_WS_PORT),

    GP_LOG_LEVEL: process.env["GP_LOG_LEVEL"],

    // nvim sets its listen address in child processes
    NVIM: process.env["NVIM"],
};

export const ENV = {
    GP_IS_DEV: process.env["GP_IS_DEV"],
    VITE_GP_WS_PORT: process.env["VITE_GP_WS_PORT"],
    GP_WEBAPP_DEV_SERVER_PORT: process.env["GP_WEBAPP_DEV_SERVER_PORT"],

    // logs
    GP_LOG_LEVEL: process.env["GP_LOG_LEVEL"],
    GP_SERVER_LOG_STREAM: process.env["GP_SERVER_LOG_STREAM"],
    GP_BRIDGE_LOG_STREAM: process.env["GP_BRIDGE_LOG_STREAM"],

    // nvim sets its listen address in child processes
    NVIM: process.env["NVIM"],
};

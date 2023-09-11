export const ENV = {
    VITE_GP_WS_PORT: process.env["VITE_GP_WS_PORT"],
    IS_DEV: Boolean(process.env["VITE_GP_WS_PORT"]),
};

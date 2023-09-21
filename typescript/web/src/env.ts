export const ENV = {
    VITE_GP_WS_PORT: import.meta.env["VITE_GP_WS_PORT"] as string | undefined,
    IS_DEV: import.meta.env.DEV,
};

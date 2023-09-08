export const ENV = {
    VITE_GP_WS_PORT: import.meta.env["VITE_GP_WS_PORT"] as string | undefined,
    VITE_GP_IS_DEV: Boolean(import.meta.env["VITE_GP_IS_DEV"]),
};

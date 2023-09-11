const PORT = import.meta.env["VITE_GP_WS_PORT"] as string | undefined;

export const ENV = {
    VITE_GP_WS_PORT: PORT,
    IS_DEV: Boolean(PORT),
};

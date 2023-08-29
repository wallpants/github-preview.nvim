const PORT: unknown = import.meta.env.VITE_GP_PORT;

export const VITE_GP_PORT = PORT ? Number(PORT) : null;

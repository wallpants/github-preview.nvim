export const ENV = {
    GP_LOG_LEVEL: process.env["GP_LOG_LEVEL"],

    // nvim sets its listen address in child processes
    NVIM: process.env["NVIM"],
};

import { ENV, createLogger } from "@gp/shared";

export const logger = createLogger(ENV.GP_SERVER_LOG_STREAM);

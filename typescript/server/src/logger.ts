import { ENV, createLogger } from "gpshared";

export const logger = createLogger(ENV.GP_SERVER_LOG_STREAM);

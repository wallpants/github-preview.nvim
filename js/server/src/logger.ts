import winston from "winston";
import { ENV } from "../../env";
import { createLogger } from "../../logger";

export const logger = createLogger(winston, ENV.GP_SERVER_LOG_STREAM, ENV.GP_LOG_LEVEL);

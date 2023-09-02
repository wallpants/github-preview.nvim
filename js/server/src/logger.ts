import winston from "winston";
import { ENV } from "../../env";
import { createLogger } from "../../logger";

export const logger = createLogger(winston, ENV.SERVER_LOG_STREAM, ENV.LOG_LEVEL);

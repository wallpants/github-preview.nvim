import { z } from "zod";

export const ENV = z
   .object({
      NVIM: z.string(),
      LOG_LEVEL: z.enum(["debug", "verbose", "info", "none"]),
      IS_DEV: z.boolean(),
   })
   .parse({
      NVIM: process.env.NVIM,
      LOG_LEVEL: process.env.LOG_LEVEL,
      IS_DEV: process.env.LOG_LEVEL !== "none",
   });

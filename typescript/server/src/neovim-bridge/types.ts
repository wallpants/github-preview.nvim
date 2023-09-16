import { type BrowserState } from "@gp/shared";
import { type Server } from "bun";

export type UnixSocketMetadata =
    | {
          browserState: BrowserState;
          webServer?: Server;
      }
    | undefined;

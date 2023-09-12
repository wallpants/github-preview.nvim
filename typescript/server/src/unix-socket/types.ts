import { type Server } from "bun";
import { type BrowserState } from "gpshared";

export type UnixSocketMetadata =
    | {
          browserState: BrowserState;
          webServer?: Server;
      }
    | undefined;

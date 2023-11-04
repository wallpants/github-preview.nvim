import { type BaseEvents } from "bunvim";
import {
    array,
    boolean,
    literal,
    maxValue,
    minValue,
    number,
    object,
    string,
    union,
    type Output,
} from "valibot";
import { type GithubPreview } from "./github-preview";

export const PluginPropsSchema = object({
    init: object({
        /** dir path where ".git" dir was found */
        root: string(),
        /**
         * current path when plugin was loaded
         * if no buffer was loaded when plugin started, path is dir and ends with "/"
         * otherwise path looks something like "/Users/.../README.md"
         * */
        path: string(),
    }),

    config: object({
        /** http/ws host "localhost" */
        host: string(),
        /** port to host the http/ws server "localhost:\{port\}" */
        port: number(),
        single_file: boolean(),
        theme: union([literal("system"), literal("light"), literal("dark")]),
        details_tags_open: boolean(),
        cursor_line: object({
            disable: boolean(),
            color: string(),
            opacity: number([minValue(0), maxValue(1)]),
        }),
        scroll: object({
            disable: boolean(),
            top_offset_pct: number(),
        }),
    }),
});

export const CursorMoveSchema = object({
    /**
     * Used to attach & detach buffers (subscribe to buffer changes)
     * as user navigates from buffer to buffer in neovim.
     * */
    buffer_id: number(),
    abs_path: string(),
    cursor_line: number(),
});

export const ContentChangeSchema = object({
    abs_path: string(),
    lines: array(string()),
});

export type PluginProps = Output<typeof PluginPropsSchema>;
export type CursorMove = Output<typeof CursorMoveSchema>;
export type ContentChange = Output<typeof ContentChangeSchema>;

export type WsServerMessage =
    | {
          type: "init";
          lines: string[];
          repoName: string;
          currentPath: string;
          config: GithubPreview["config"];
          cursorLine: number | null;
      }
    | {
          type: "entries";
          path: string;
          entries: string[];
      }
    | {
          type: "entry";
          currentPath: string;
          lines: string[];
          cursorLine: number | null;
          hash: string | null;
      }
    | {
          type: "cursor-move";
          cursorLine: number | null;
          currentPath: string;
          lines?: string[];
      }
    | {
          type: "content-change";
          currentPath: string;
          lines: string[];
      }
    | {
          type: "update-config";
          config: GithubPreview["config"];
      }
    | {
          type: "goodbye";
      };

export type WsBrowserMessage =
    | {
          type: "init";
      }
    | {
          type: "get-entries";
          path: string;
      }
    | {
          type: "get-entry";
          path: string;
      }
    | {
          type: "update-config";
          config: Partial<Config>;
      };

// eslint-disable-next-line
export interface CustomEvents extends BaseEvents {
    requests: {
        onBeforeExit: [];
    };
    notifications: {
        // github-preview
        AttachBuffer: [buffer: number, path: string];
        CursorMove: [buffer: number, path: string, cursor_line: number];

        // neovim native
        nvim_buf_detach_event: [buffer: number];
        nvim_buf_lines_event: [
            buffer: number,
            changedtick: number,
            firstline: number,
            lastline: number,
            linedata: string[],
            more: boolean,
        ];
        nvim_buf_changedtick_event: [buffer: number, changedtick: number];
    };
}

export type Config = PluginProps["config"];

import { type BaseEvents } from "bunvim";
import {
    array,
    boolean,
    coerce,
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

export const ThemeSchema = union([literal("system"), literal("light"), literal("dark")]);
export type Theme = Output<typeof ThemeSchema>;

export const BuildConstsSchema = object({
    HOST: string(),
    PORT: coerce(number(), Number),
    IS_DEV: coerce(boolean(), Boolean),
    THEME: ThemeSchema,
});
export type BuildConsts = Output<typeof BuildConstsSchema>;

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
        theme: ThemeSchema,
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
export type PluginProps = Output<typeof PluginPropsSchema>;
export type Config = PluginProps["config"];

export const CursorMoveSchema = object({
    /**
     * Used to attach & detach buffers (subscribe to buffer changes)
     * as user navigates from buffer to buffer in neovim.
     * */
    buffer_id: number(),
    abs_path: string(),
    cursor_line: number(),
});
export type CursorMove = Output<typeof CursorMoveSchema>;

export const ContentChangeSchema = object({
    abs_path: string(),
    lines: array(string()),
});
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
          type: "cursor_move";
          cursorLine: number | null;
          currentPath: string;
          lines?: string[];
      }
    | {
          type: "content_change";
          currentPath: string;
          /**
           * Offset recalculation is triggered on markdown container element resize.
           * Sometimes adding new lines doesn't change the element size so offsets
           * are not recalculated, leading to incorrect cursorline position.
           * To fix that, we notify the browser on linesCountChange
           * to trigger offset calculation.
           * */
          linesCountChange: boolean;
          lines: string[];
      }
    | {
          type: "update_config";
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
          type: "get_entries";
          path: string;
      }
    | {
          type: "get_entry";
          path: string;
      }
    | {
          type: "update_config";
          config: Partial<Config>;
      };

// eslint-disable-next-line
export interface CustomEvents extends BaseEvents {
    requests: {
        on_config_update: [
            update_action:
                | "reset_overrides"
                | "single_file_on"
                | "single_file_off"
                | "details_tags_open"
                | "details_tags_closed"
                | "scroll_on"
                | "scroll_off"
                | "cursorline_on"
                | "cursorline_off",
        ];
        on_before_exit: [];
    };
    notifications: {
        // github-preview
        attach_buffer: [buffer: number, path: string];
        cursor_move: [buffer: number, path: string, cursor_line: number];

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

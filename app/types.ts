import { type BaseEvents } from "bunvim";
import { z } from "zod";

export const ThemeSchema = z.object({
   name: z.enum(["system", "light", "dark"]),
   high_contrast: z.boolean(),
});
export type Theme = z.infer<typeof ThemeSchema>;

export const BuildConstsSchema = z.object({
   IS_DEV: z.boolean(),
   THEME: ThemeSchema,
});
export type BuildConsts = z.infer<typeof BuildConstsSchema>;

export const PluginPropsSchema = z.object({
   init: z.object({
      /** dir path where ".git" dir was found */
      root: z.string(),
      /**
       * current path when plugin was loaded
       * if no buffer was loaded when plugin started, path is dir and ends with "/"
       * otherwise path looks something like "/Users/.../README.md"
       * */
      path: z.string(),
   }),

   config: z.object({
      /** http/ws host "localhost" */
      host: z.string(),
      /** port to host the http/ws server "localhost:\{port\}" */
      port: z.number(),
      single_file: z.boolean(),
      theme: ThemeSchema,
      details_tags_open: z.boolean(),
      cursor_line: z.object({
         disable: z.boolean(),
         color: z.string(),
         opacity: z.number().min(0).max(1),
      }),
      scroll: z.object({
         disable: z.boolean(),
         top_offset_pct: z.number(),
      }),
   }),
});
export type PluginProps = z.infer<typeof PluginPropsSchema>;
export type Config = PluginProps["config"];

export type ContentChange = {
   abs_path: string;
   lines: string[];
};

export type UpdateConfigAction =
   | ["clear_overrides"]
   | ["theme_name", "system" | "light" | "dark"]
   | ["theme_high_contrast", "on" | "off"]
   | ["single_file", "toggle" | "on" | "off"]
   | ["details_tags", "toggle" | "open" | "closed"]
   | ["scroll", "toggle" | "on" | "off"]
   | ["scroll.offset", number]
   | ["cursorline", "toggle" | "on" | "off"]
   | ["cursorline.color", string]
   | ["cursorline.opacity", number];

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
        action: UpdateConfigAction;
     };

export type GithubPreviewConfig = {
   dotfiles: Config;
   overrides: Config;
};

export type WsServerMessage =
   | {
        type: "init";
        lines: string[];
        repoName: string;
        currentPath: string;
        config: GithubPreviewConfig;
        cursorLine: number | null;
        currentEntries: string[] | undefined;
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
        hash: string | undefined;
        currentEntries: string[] | undefined;
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
        config: GithubPreviewConfig;
     }
   | {
        type: "goodbye";
     };

// eslint-disable-next-line
export interface CustomEvents extends BaseEvents {
   requests: {
      config_update: UpdateConfigAction;
      before_exit: [];
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

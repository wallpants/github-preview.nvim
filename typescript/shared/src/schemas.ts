import { boolean, number, object, string } from "valibot";

export const PluginInitSchema = object({
    /** port to host the http/ws server "localhost:\{port\}" */
    port: number(),
    /** dir path where ".git" dir was found */
    root: string(),
    /**
     * current path when plugin was loaded
     * if no buffer was loaded when plugin started, path is dir and ends with "/"
     * otherwise path looks something like "/Users/.../README.md"
     * */
    path: string(),
    scroll_debounce_ms: number(),
    disable_sync_scroll: boolean(),
});

export const CursorMoveSchema = object({
    abs_path: string(),
    cursor_line: number(),
});

export const ContentChangeSchema = object({
    abs_path: string(),
    content: string(),
});

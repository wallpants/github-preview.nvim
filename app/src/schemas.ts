import { array, boolean, number, object, string } from "valibot";

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
    content: array(string()),
    single_file: boolean(),
    cursor_line: object({
        disable: boolean(),
        color: string(),
    }),
    scroll: object({
        disable: boolean(),
        top_offset_pct: number(),
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
    content: array(string()),
});

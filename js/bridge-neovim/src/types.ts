import { array, boolean, literal, number, object, string, union, type Output } from "valibot";

const SyncScrollTypeSchema = union([literal("middle"), literal("top"), literal("relative")]);

export const PluginPropsSchema = object({
    port: number(),
    cwd: string(),
    scroll_debounce_ms: number(),
    disable_sync_scroll: boolean(),
    ignore_buffer_patterns: array(string()),
    sync_scroll_type: SyncScrollTypeSchema,
});

export type PluginProps = Output<typeof PluginPropsSchema>;

// cspell:ignore abuf amatch autocommand
export const RPCNotificationArgSchema = object({
    /** autocommand id */
    id: number(),
    /** expanded value of <amatch> */
    match: string(),
    /** expanded value of <abuf> */
    buf: number(),
    /** absolute filepath */
    file: string(),
    /** name of the triggered event */
    event: string(),
});

export type RPCNotificationArg = Output<typeof RPCNotificationArgSchema>;

export const NvimCursorMoveSchema = object({
    cursor_line: number(),
    content_len: number(),
    win_height: number(),
    win_line: number(),
    sync_scroll_type: SyncScrollTypeSchema,
});

export type NvimCursorMove = Output<typeof NvimCursorMoveSchema>;

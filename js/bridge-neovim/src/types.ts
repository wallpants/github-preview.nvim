import {
    array,
    boolean,
    literal,
    number,
    object,
    string,
    union,
    type Output,
} from "valibot";

export const PluginPropsSchema = object({
    port: number(),
    log_output: union([literal("none"), literal("file"), literal("print")]),
    cwd: string(),
    scroll_debounce_ms: number(),
    disable_sync_scroll: boolean(),
    ignore_buffer_patterns: array(string()),
    sync_scroll_type: union([
        literal("middle"),
        literal("top"),
        literal("relative"),
    ]),
});

export type PluginProps = Output<typeof PluginPropsSchema>;

// cspell:ignore abuf amatch autocommand
export interface NeovimNotificationArg {
    /** autocommand id */
    id: number;
    /** expanded value of <amatch> */
    match: string;
    /** expanded value of <abuf> */
    buf: number;
    /** absolute filepath */
    file: string;
    /** name of the triggered event */
    event: string;
}

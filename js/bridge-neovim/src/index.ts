import { minimatch } from "minimatch";
import { attach } from "neovim";
import { parse } from "valibot";
import { ENV } from "../../env";
import { PluginPropsSchema, type NeovimNotificationArg } from "./types";

const socket = ENV.NVIM_LISTEN_ADDRESS ?? process.argv[2];

export const EDITOR_EVENTS = [
    "markdown-preview-content-change",
    "markdown-preview-pos-update",
] as const;

async function main() {
    if (!socket) throw Error("missing socket");
    const nvim = attach({ socket });
    const props = parse(PluginPropsSchema, await nvim.getVar("markdown_preview_props"));

    for (const event of EDITOR_EVENTS) await nvim.subscribe(event);

    nvim.on(
        "notification",
        async (event: (typeof EDITOR_EVENTS)[number], [arg]: NeovimNotificationArg[]) => {
            if (!arg) return;
            for (const ignorePattern of props.ignore_buffer_patterns) {
                // we use this to avoid updating browser when opening
                // buffers for NvimTree, telescope, and such
                if (minimatch(arg.file, ignorePattern, { matchBase: true })) return;
            }

            if (event === "markdown-preview-content-change") {
                const buffers = await nvim.buffers;
                const buffer = buffers.find((b) => b.id === arg.buf);
                if (!buffer) throw Error("buffer not found");
                const text = (await buffer.lines).join("\n");
                console.log("text: ", text);
            }
        },
    );
}

void main();

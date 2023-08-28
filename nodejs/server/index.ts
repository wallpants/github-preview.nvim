import { attach } from "neovim";
import { parse } from "valibot";
import { PluginPropsSchema } from "../types";
import { PORT, SOCKET } from "./env";
import { startServer } from "./start-server";

// we check for SOCKET for dev env
const socket = SOCKET || process.argv[2];

async function killExisting(port: number) {
    try {
        // we check for PORT for dev env
        await fetch(`http://localhost:${PORT || port}`, { method: "POST" });
    } catch (err) {
        console.log("no server to kill");
    }
}

export async function main() {
    if (!socket) throw Error("missing socket");
    const nvim = attach({ socket });
    const props = parse(
        PluginPropsSchema,
        await nvim.getVar("markdown_preview_props"),
    );
    await killExisting(props.port);
    await startServer(nvim, props);
}

void main();

// nvim.on('request', (method: string, args: any, resp: any) => {
// if (method === 'close_all_pages') {
//   app.closeAllPages()
// }
// resp.send()
// })
// vim.rpcrequest(0, "close_all_pages", {})

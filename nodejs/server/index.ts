import { attach } from "neovim";
import { startServer } from "./start-server.js";

const socket = process.argv[2];

export async function main() {
    if (!socket) throw Error("missing socket");
    const nvim = attach({ socket });
    const PORT = Number(await nvim.getVar("markdown_preview_port"));
    await startServer(nvim, PORT);
}

void main();

// nvim.on('request', (method: string, args: any, resp: any) => {
// if (method === 'close_all_pages') {
//   app.closeAllPages()
// }
// resp.send()
// })
// vim.rpcrequest(0, "close_all_pages", {})

import { attach } from "localbunvim";

const SOCKET = process.env["NVIM"];
if (!SOCKET) throw Error("socket missing");

const nvim = await attach({ socket: SOCKET });
const response = await nvim.request("nvim_get_var", "github_preview_init");
console.log("response: ", response);

await nvim.request("nvim_subscribe", "github-preview-cursor-move");

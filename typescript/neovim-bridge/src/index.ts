import { attach } from "localbunvim";

const SOCKET = process.env["NVIM"];
if (!SOCKET) throw Error("socket missing");

const nvim = await attach({ socket: SOCKET });
const response = await nvim.call("nvim_get_var", "github_preview_init");
// const response = await nvim.call("nvim_get_api_info");
console.log("typeof response: ", typeof response);
console.log("response: ", response);

// const apiInfo = await nvim.request("nvim_get_api_info");
// await Bun.write(resolve(import.meta.dir, "out.json"), JSON.stringify(apiInfo));

// await nvim.request("nvim_subscribe", "github-preview-cursor-move");

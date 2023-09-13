import { NeovimApiInfo, attach } from "bunvim";

const SOCKET = process.env["NVIM"];
if (!SOCKET) throw Error("socket missing");

const nvim = await attach<NeovimApiInfo>({ socket: SOCKET });
const response = await nvim.call("nvim_get_var", ["github_preview_init"]);
// const response = await nvim.call("nvim_get_api_info");
console.log("typeof response: ", typeof response);
console.log("response: ", response);
const name = await nvim.call("nvim_buf_get_name", [0]);
console.log("name: ", name);

// const apiInfo = await nvim.request("nvim_get_api_info");
// await Bun.write(resolve(import.meta.dir, "out.json"), JSON.stringify(apiInfo));

// await nvim.request("nvim_subscribe", "github-preview-cursor-move");

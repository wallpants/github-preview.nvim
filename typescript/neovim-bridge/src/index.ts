import { attach } from "neovim";

const SOCKET = process.env["NVIM"];
if (!SOCKET) throw Error("socket NVIM missing");

const nvim = attach({ socket: SOCKET });

const init = await nvim.getVar("github_preview_init");
console.log("init: ", init);

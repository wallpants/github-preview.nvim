import { SHARED_VAL } from "@gc/shared/consts.ts";
import { attach } from "neovim";

const SOCKET = process.env["NVIM"];
const VITE_GP_IS_DEV = process.env["VITE_GP_IS_DEV"];
if (!SOCKET) throw Error("socket NVIM missing");

const nvim = attach({ socket: SOCKET });

const init = await nvim.getVar("github_preview_init");
console.log("init", init);
console.log("VITE_GP_IS_DEV", VITE_GP_IS_DEV);
console.log("SHARED_VAL", SHARED_VAL);

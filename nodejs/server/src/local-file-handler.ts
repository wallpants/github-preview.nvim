/*
 * https://github.com/iamcco/markdown-preview.nvim/blob/master/app/routes.js
 */
import fs from "node:fs";
import { type IncomingMessage, type ServerResponse } from "node:http";
import path from "node:path";
import { LOCAL_FILE_ROUTE } from "../../consts";

export function localFileHandler(
    req: IncomingMessage,
    res: ServerResponse,
    pwd: string,
) {
    let imgPath = decodeURIComponent(
        decodeURIComponent(req.url!.replace(LOCAL_FILE_ROUTE, "")),
    );
    imgPath = imgPath.replace(/\\ /g, " ");
    if (imgPath[0] !== "/" && imgPath[0] !== "\\") {
        imgPath = path.join(pwd, imgPath);
    } else if (!fs.existsSync(imgPath)) {
        let tmpDirPath = pwd;
        while (tmpDirPath !== "/" && tmpDirPath !== "\\") {
            tmpDirPath = path.normalize(path.join(tmpDirPath, ".."));
            const tmpImgPath = path.join(tmpDirPath, imgPath);
            if (fs.existsSync(tmpImgPath)) {
                imgPath = tmpImgPath;
                break;
            }
        }
    }
    if (fs.existsSync(imgPath) && !fs.statSync(imgPath).isDirectory()) {
        if (imgPath.endsWith("svg")) {
            res.setHeader("content-type", "image/svg+xml");
        }
        return fs.createReadStream(imgPath).pipe(res);
    }
    return;
}

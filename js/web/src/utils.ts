export function getFileName(path: string | undefined) {
    return path?.split("/").pop();
}

export function getFileExt(path: string | undefined) {
    return path?.split(".").pop();
}

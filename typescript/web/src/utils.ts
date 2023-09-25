import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function getBreadCrumbs(root: string | undefined, path: string | undefined): string[] {
    if (!root || !path) return [];
    const relative = path.slice(root.length);
    return relative.split("/");
}

export function getFileName(path: string | undefined) {
    return path?.split("/").pop();
}

export function getFileExt(path: string | undefined) {
    return path?.split(".").pop();
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

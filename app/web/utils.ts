import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function appendDisabledLinkTooltip(element: HTMLElement) {
    element.style.setProperty("position", "relative");
    element.classList.add("disabled-link");
    const tooltip = document.createElement("div");
    tooltip.classList.add("tooltip");
    tooltip.innerHTML = "<p>relative links are disabled in single-file mode.</p>";
    element.appendChild(tooltip);
}

export function getEntryName(path: string) {
    const isDir = path === "" || path.endsWith("/");
    const segments = getSegments(path);
    let name = segments.pop();
    if (isDir) name = segments.pop();
    return name;
}

export function getSegments(path: string | undefined): string[] {
    if (!path) return [];
    return path.split("/");
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

/* eslint-disable */
export function isEqual(obj1: any, obj2: any) {
    // If objects are not the same type, return false
    if (typeof obj1 !== typeof obj2) {
        return false;
    }
    // If objects are both null or undefined, return true
    if (obj1 === null && obj2 === null) {
        return true;
    }
    // If objects are both primitive types, compare them directly
    if (typeof obj1 !== "object") {
        return obj1 === obj2;
    }
    // If objects are arrays, compare their elements recursively
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length) {
            return false;
        }
        for (let i = 0; i < obj1.length; i++) {
            if (!isEqual(obj1[i], obj2[i])) {
                return false;
            }
        }
        return true;
    }
    // If objects are both objects, compare their properties recursively
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (const key of keys1) {
        if (!obj2.hasOwnProperty(key) || !isEqual(obj1[key], obj2[key])) {
            return false;
        }
    }
    return true;
}

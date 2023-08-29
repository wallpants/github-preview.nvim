declare module "istextorbinary" {
    function isBinary(path: string): boolean;
    function isText(path: string): boolean;
    function getEncoding(path: string): "utf8" | "binary";
}

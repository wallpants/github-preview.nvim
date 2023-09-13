import { type apiInfo } from "./apiInfo";

type Functions = typeof apiInfo.functions;
type FunctionName = Functions[number]["name"];
type FunctionParams<N extends FunctionName> = Functions[number][N];

const typeMap = {
    String: "string",
    Integer: "number",
    Boolean: "boolean",
    Array: "Array<any>",
    "ArrayOf(Something)": "Array<Something>",
    Dictionary: "{}",
    Object: "VimObject",
    Buffer: "number",
    Tabpage: "number",
    Window: "number",
};

export type VimObject = number | boolean | string | number[] | Record<string, unknown>;

export function typedRequest<F extends FunctionName>(method: F, params: FunctionParams<F>) {
    console.log("method: ", method);
    console.log("params: ", params);
}

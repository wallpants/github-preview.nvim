import { type Mermaid } from "mermaid";

declare const mermaid: Mermaid;

export async function runMermaid() {
    await mermaid.run({
        querySelector: ".mermaid",
        suppressErrors: true,
        postRenderCallback(_id) {
            // console.log("id: ", id);
        },
    });
}

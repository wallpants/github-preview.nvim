import { type Mermaid, type MermaidConfig } from "mermaid";

declare const mermaid: Mermaid;

export function mermaidInit(config: MermaidConfig) {
    mermaid.initialize(config);
}

export async function mermaidRun() {
    await mermaid.run({
        querySelector: ".mermaid",
        suppressErrors: true,
        postRenderCallback(_id) {
            // console.log("id: ", id);
        },
    });
}

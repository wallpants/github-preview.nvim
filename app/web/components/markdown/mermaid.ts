import { type Mermaid, type MermaidConfig } from "mermaid";

declare const mermaid: Mermaid;

// this object exists so that we don't need to keep declaring "const mermaid" as above
// and to centralize all mermaid operations
export const myMermaid = {
    mermaids: new Map<string, string>(),

    initialize(config: MermaidConfig) {
        this.mermaids = new Map();
        mermaid.initialize(config);
    },

    async run() {
        const newMermaids = new Map<string, string>();
        const documentMermaids = document.querySelectorAll(".mermaid");

        let id = 0;
        for (const dMermaid of documentMermaids) {
            const definition = dMermaid.textContent ?? "";

            let newSvg = this.mermaids.get(definition);

            if (!newSvg) {
                try {
                    const { svg } = await mermaid.render(`mermiad-${++id}`, definition);
                    newSvg = svg;
                } catch (e) {
                    //
                }
            }

            if (!newSvg) return;

            newMermaids.set(definition, newSvg);
            dMermaid.innerHTML = newSvg;
        }

        this.mermaids = newMermaids;
    },
};

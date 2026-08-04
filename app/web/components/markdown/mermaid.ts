import mermaid, { type MermaidConfig } from "mermaid";

export const myMermaid = {
   // null marks a definition that failed to render: mermaid parse errors are
   // deterministic, so the same source is never re-attempted (fixing the
   // diagram changes the source and therefore the key)
   memoMermaids: new Map<string, string | null>(),
   incId: 0,

   initialize(config: MermaidConfig) {
      this.memoMermaids = new Map();
      mermaid.initialize(config);
   },

   /**
    * renders memoized mermaids only so we can run it synchronously
    */
   renderMemoized(element?: HTMLElement) {
      const documentMermaids = (element ?? document).querySelectorAll(".mermaid");

      const memoMermaids = new Map<string, string | null>();
      const pendingMermaids: Element[] = [];

      for (const dMermaid of documentMermaids) {
         const renderedDefinition = dMermaid.getAttribute("data-rendered");
         if (renderedDefinition) {
            // carry the clean svg forward instead of re-reading innerHTML:
            // pantsdown's script wraps the svg with pan/zoom controls after
            // render, and serializing those back into the memo would
            // duplicate them (dead, listener-less) on every re-render
            memoMermaids.set(
               renderedDefinition,
               this.memoMermaids.get(renderedDefinition) ?? dMermaid.innerHTML,
            );
            continue;
         }

         const definition = dMermaid.textContent;
         if (!definition) continue;

         const svg = this.memoMermaids.get(definition);
         if (svg) {
            memoMermaids.set(definition, svg);
            dMermaid.setAttribute("data-rendered", definition);
            dMermaid.innerHTML = svg;
         } else if (svg === null) {
            // known-broken definition: keep showing the source, don't retry
            memoMermaids.set(definition, null);
         } else {
            pendingMermaids.push(dMermaid);
         }
      }

      return {
         memoMermaids,
         pendingMermaids,
      };
   },

   /**
    * renders all mermaids
    * uses memoized mermaids if present and generates missing
    */
   async renderAsync() {
      const { memoMermaids, pendingMermaids } = this.renderMemoized();

      for (const dMermaid of pendingMermaids) {
         const renderedDefinition = dMermaid.getAttribute("data-rendered");

         const definition = renderedDefinition ?? dMermaid.textContent;
         if (!definition) continue;

         let svg = this.memoMermaids.get(definition);

         if (svg === undefined) {
            try {
               const { svg: newSvg } = await mermaid.render(`mermaid-${++this.incId}`, definition);
               svg = newSvg;
            } catch (_) {
               svg = null;
            }
         }

         memoMermaids.set(definition, svg);
         if (!svg) continue;

         dMermaid.innerHTML = svg;
      }

      this.memoMermaids = memoMermaids;
   },
};

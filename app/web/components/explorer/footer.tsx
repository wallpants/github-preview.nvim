import { cn } from "../../utils.ts";

export const Footer = ({ isExpanded }: { isExpanded: boolean }) => (
   <div
      className={cn(
         "bottom-0 h-14 inset-x-0 absolute flex items-center justify-center",
         "border-github-border-default bg-github-canvas-default rounded-br-md border-t",
      )}
   >
      {isExpanded ? (
         <p className="!mb-0 mr-4 text-sm text-center">
            with ♥️ by{" "}
            <a href="https://wallpants.io" target="_blank" rel="noreferrer">
               wallpants.io
            </a>
         </p>
      ) : (
         <a
            href="https://wallpants.io"
            target="_blank"
            rel="noreferrer"
            className="size-8 overflow-hidden rounded-full"
         >
            <img src="/__github_preview__/static/wallpants-256.png" />
         </a>
      )}
   </div>
);

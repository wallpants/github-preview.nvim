import wallpants from "../../static/wallpants-256.png";
import { cn } from "../../utils.ts";

export const Footer = ({ isExpanded }: { isExpanded: boolean }) => (
   <div
      className={cn(
         "absolute inset-x-0 bottom-0 flex h-14 items-center justify-center",
         "rounded-br-md border-t border-github-border-default bg-github-canvas-default",
      )}
   >
      {isExpanded ? (
         <p className="mr-4 !mb-0 text-center text-sm">
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
            <img src={wallpants} />
         </a>
      )}
   </div>
);

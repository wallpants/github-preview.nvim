import { useContext, useState } from "react";
import { type Config } from "../../../types.ts";
import { useOnDocumentClick } from "../../use-on-document-click.ts";
import { cn, isEqual } from "../../utils.ts";
import { websocketContext } from "../websocket-provider/context.ts";
import { EntryComponent } from "./entry.tsx";
import { Footer } from "./footer.tsx";
import { Header } from "./header.tsx";
import { CollapsedSettings } from "./settings/collapsed.tsx";
import { Settings } from "./settings/index.tsx";

export const Explorer = () => {
   const { currentPath, config } = useContext(websocketContext);
   const [configOpen, setConfigOpen] = useState<null | keyof Config | "no-key">(null);
   const [isExpanded, setIsExpanded] = useState(false);
   const [startExit, setStartExit] = useState(false);
   const [settingsOffset, setSettingsOffset] = useState(0);
   const isOverriden = !isEqual(config?.dotfiles, config?.overrides);

   useOnDocumentClick({
      disabled: !configOpen,
      callback: () => {
         setConfigOpen(null);
      },
   });

   return (
      <div
         className={cn(
            "rounded-r-md border-github-border-default relative border border-l-0",
            isExpanded ? "w-80" : "w-12",
         )}
      >
         <div
            className={isExpanded ? "inset-0 pb-56 pt-16 absolute block overflow-y-auto" : "hidden"}
         >
            {config?.overrides.single_file ? (
               <div className="!px-3">
                  <h3>Single-file mode</h3>
                  <p>File explorer only available when in repository mode.</p>
               </div>
            ) : (
               <EntryComponent path="" depth={-1} currentPath={currentPath} />
            )}
         </div>
         <Header
            className="inset-x-0 top-0 rounded-tr-md absolute z-10"
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
            setSettingsOffset={setSettingsOffset}
            setConfigOpen={setConfigOpen}
            isOverriden={isOverriden}
         />
         {!isExpanded && (
            <CollapsedSettings
               setSettingsOffset={setSettingsOffset}
               setConfigOpen={setConfigOpen}
               configOpen={configOpen}
               startExit={startExit}
            />
         )}
         {configOpen ? (
            <Settings
               cKey={configOpen}
               isOverriden={isOverriden}
               settingsOffset={settingsOffset}
               setStartExit={setStartExit}
            />
         ) : null}
         <Footer isExpanded={isExpanded} />
      </div>
   );
};

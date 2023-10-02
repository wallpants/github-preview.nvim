import { hydrateRoot } from "react-dom/client";
import { Index } from "./index.tsx";

// consts defined during Bun build
declare const __GP_HOST__: string;
declare const __GP_PORT__: number;
declare const __DEV__: boolean;

hydrateRoot(document, <Index host={__GP_HOST__} port={__GP_PORT__} is_dev={__DEV__} />);

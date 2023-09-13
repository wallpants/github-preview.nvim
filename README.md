asdf

# my name is casas medina

-   [] according to logs, there's a content-change event that's being received by the server on cursor move

```sh
verbose 14:54:39
{ type: 'github-preview-cursor-move',
  data:
   { cursor_line: 4,
     abs_path: '/Users/gualcasas/Projects/nvim-plugins/github-preview.nvim/README.md' },
  level: 'verbose',
  message: 'unixSocket event received' }
verbose 14:54:39
{ currentPath: '/Users/gualcasas/Projects/nvim-plugins/github-preview.nvim/README.md',
  cursorMoveLine: 4,
  level: 'verbose',
  message: 'content-change' }
```

-   [x] scroll indicator does not go up to the first line on readme.md
-   [x] do not use vite js api, go back to serve-handler, it's boots way faster
-   [x] update @gp/shared package.json export's to bun, now that we're staying with bun
-   [] send goodbye messsage from browser when closing tab to close server
-   [] in neovim bridge check if unix server is running before starting a new one
-   [x] add winston back
-   [] when running the plugin with no buffers open (searching for readme.md), readme.md is rendered as code and not as markdown
-   [] after refreshing browser everything's fucked up
-   [] if root is not found, server should start in single file mode
-   [x] does cmd+shift+r clear localStorage? is the webapp being cached? does it happen both in dev and prod?
-   [x] we lose syntax on content change
-   [x] when cd .. on webapp, if a file is currently open it stays open after the "cd ..", file should be closed
-   [x] when cd .. on webapp, if we're looking at a file, file is closed instead of going to parent
-   [x] webapp logs "received" on production
-   [] add "ping" request, kill processes after a while of inactivity
-   [] what happens if we have a running instance and try running another?
-   [x] webapp should send hello message on connection
-   [x] make PORT configurable
-   [x] improve css (https://github.com/sindresorhus/github-markdown-css)
    -   [] close browser tab on buffer delete
-   [x] implement auto scroll & make it configurable
-   [x] send buffer content on init, page opens with no content otherwise
-   [x] if user starts server after server had been started somewhere else kill other server and restart in current session
-   [] if server belongs to current session, update buffer id
-   [x] send message when we want to close browser tab instead of closing onClose, if we close tab on ws.onClose, we can't refresh
-   [x] improve socket connectivity? If laptop closed and connection closes, user must refresh website to reestablish connection. (no bueno)
-   [x] why isn't vite automagically loading .env.dev file?
-   [x] fix scroll so it doesn't take explorer into consideration when calculating offset
-   [] scroll doesn't work with code files (non .md)
-   [] current path shouldn't be required in WsServerMessage
-   [] add bottom margin to allow scrolling when markdown content too short
-   [] github renders html within markdown [see here](https://github.com/microsoft/vscode-extension-samples), **VS Code Extension Samples** doesn't render well in github-preview

[follow this link](https://github.com)

![Alt text](https://www.digitalocean.com/_next/static/media/intro-to-cloud.d49bc5f7.jpeg)

what if I type and then gualberto

```ts
console.log("hello world");
```

[eslint line 9](.eslintrc.cjs#L9)

[eslint](.eslintrc.cjs)

```typescript
import { common, createStarryNight } from "@wooorm/starry-night";

TypeScript JavaScript ASDF jk T
TypeScript JavaScript
const starryNight = await createStarryNight(common, {
    getOnigurumaUrlFetch() {
        return new URL("/file.wasm", window.location.href);
    },
});
```

and we can type and this thing doesn't rerender

## Vite Development

1. Open markdown file in neovim and run `:GithubPreview` to start server
2. Close browser tab that was opened by previous
3. Start vite dev server and then something else

```bash
github-preview/: $ pnpm web:dev
```

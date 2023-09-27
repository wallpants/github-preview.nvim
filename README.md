asdf

# my name is casas medina

-   [ ] add padding at bottom of explorer tree
-   [ ] navigating to root, or starting github-preview with no buffer doesn't render root README
-   [ ] if file too large, don't send entry or browser freezes
-   [ ] scroll to top if cursorLine === null
-   [ ] include types in bunvim instead of forcing the user to create them
-   [x] when starting github preview whilst on root readme, scroll offsets are incorrect
-   [x] Scroll gets kind of wonky sometimes whilst typing. Seems to happen more when close to end of buffer
-   [ ] Change page title & favicon
-   [x] Implement autoscroll
-   [x] Make cursor indicator customizable
-   [ ] allow users to override markdown codeblock language per file extension
    -   [ ] log to the console the file extension detected to make it easier for the user to know what to override
-   [ ] send goodbye messsage from browser when closing tab to close server
-   [ ] if root is not found, server should start in single file mode
-   [ ] what happens if we have a running instance and try running another?
-   [ ] github renders html within markdown [see here](https://github.com/microsoft/vscode-extension-samples), **VS Code Extension Samples** doesn't render well in github-preview

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

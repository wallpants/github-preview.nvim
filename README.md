<h1>Hello world</h1>

# Github Preview

- [ ] think of more generic name than github-preview
- [ ] implement link follow for local files
- [ ] git hook to compile tailwind
- [ ] write docs
- [ ] implement code copy
- [ ] move css to pantsdown
- [ ] what happens if we have a running instance and try running another?

[eslint line 9](.eslintrc.cjs#L9)

[eslint](.eslintrc.cjs)

![image](wallpants-512.png)

![image](./wallpants-512.png)

<img src="wallpants-512.png" style="height: 100px;" />

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

## Vite Development

1. Open markdown file in neovim and run `:GithubPreview` to start server
2. Close browser tab that was opened by previous
3. Start vite dev server and then something else

```bash
github-preview/: $ pnpm web:dev
```

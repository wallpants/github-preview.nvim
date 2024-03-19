#### [👈 README.md](/README.md)

# Development

## ✅ Requirements

- [x] [Bun](https://bun.sh)
- [x] [Neovim](https://neovim.io)

## 💻 Setup

The following instructions assume the path `~/Projects/nvim-plugins/` exists.
If it doesn't exist, create it or make sure to update relevant commands to
match your file structure.

---

**1. Clone `github-preview.nvim` to `~/Projects/nvim-plugins/github-preview.nvim`
and install dependencies:**

```sh
cd ~/Projects/nvim-plugins
git clone git@github.com:wallpants/github-preview.nvim.git
cd github-preview.nvim
bun install
```

---

**2. Setup [lazy.nvim](https://github.com/folke/lazy.nvim) for plugin development:**

```lua
-- in your neovim config files, wherever you set up lazy

require("lazy").setup("plugins", {
    -- ...config

    dev = {
        -- path where dev plugins are to be found
        path = vim.fn.expand("~/Projects/nvim-plugins"),

        -- fallback to github if dev plugins not found locally
        fallback = true,
    },
})
```

---

**3. Install plugin and setup for development**

Specify a `log_level` to enable _dev-mode_.

In `github-preview.nvim` _dev-mode_ enables **logging** and _hot-reloading_ of the bun app.

```lua
{
    "wallpants/github-preview.nvim",
    -- if dev = true, lazy will look for plugin in "~/Projects/nvim-plugins"
    dev = true,
    cmd = { "GithubPreviewToggle" },
    opts = {
        log_level = "debug",
    },
},
```

---

**4. Start listening for logs**

Use [bunvim's CLI tool](https://github.com/wallpants/bunvim#console) to listen for logs.

The following command will start a service that will listen for logs.
You can stop the service with `CTRL+C`.

At the repository root `~/Projects/nvim-plugins/github-preview.nvim` run:

```sh
bun run logs
```

You should see no output until the plugin is started in the next step.

---

**5. Open Neovim and start the plugin**

Open Neovim, load a markdown file into the current buffer and run `:GithubPreviewToggle`

A new tab should open in your browser and logs will be printed both in Neovim and in the
logs process started in the previous step.

Run `:messages` to see what's been printed in Neovim.

Logs that are shown under `:messages` in Neovim, are logs created server-side via
`console.log()`. You can use `console.log()` for quick logs, but as you'll see,
sometimes they're hard to follow/read. For a more complete logging experience, use
[bunvim logging](https://github.com/wallpants/bunvim#%EF%B8%8F-logging).

---

**6. Start editing server-side code**

You can now start working on **server-side** code.

I haven't fully figured out _hot-reloading_ on **server-side**, so you'll need to
restart the plugin sometimes for your changes to take effect.

Changes to the **webapp** will not be reflected even if you manually refresh
your browser. You'll need to restart the plugin for the **webapp** to update.
Next step enables _hot-reloading_ for the **webapp**.

---

**7. Start _hot-reloading_ webapp server**

At the repository root `~/Projects/nvim-plugins/github-preview.nvim` in a new terminal run:

```sh
bun run web:dev
```

This will start a [vite dev server](https://vitejs.dev/) and open a new browser
tab where any changes you make to the **webapp** code should be applied live.

Dev logs are printed to your browser's console.

> [!IMPORTANT]
> Vite's dev server handles css post-processing, <strong>bun does not yet</strong>.
>
> This means any changes to tailwind classes are immediately reflected when
> the webapp is served by vite's dev server, but for the changes to be reflected
> when served directly by bun (in production) we need to manually run the command
> `bun run tailwind:compile` to generate required CSS.

---

# 🏗️ Contributing

## Formatting and Linting

This project uses [prettier](https://prettier.io/) and [eslint](https://eslint.org/)
to enforce coding style and quality standards.

Make sure to set them up in your editor. You can configure **prettier** to
_format on save_ or you can manually run the following **package.json**
script to format files:

```
bun run format
```

To ensure that there are no lint issues, you can run the **package.json** script:

```
bun run lint
```

To ensure that there are no TypeScript issues, you can run the **package.json** script:

```
bun run typecheck
```

If you make any changes to tailwind classes, you must also manually run the
following **package.json** script to generate relevant CSS files:

```
bun run tailwind:compile
```

> [!NOTE]
> There's a [github action](https://github.com/wallpants/github-preview.nvim/blob/main/.github/workflows/release.yml)
> that verifies if these actions were performed and will notify you if any steps were skipped.

## Git Commits

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) to handle versioning.

**semantic-release** requires commit messages to follow the
[Conventional Commit](https://www.conventionalcommits.org/en/v1.0.0/) format. To ensure your commits
follow the format, run the **package.json** script `bun run commit` to perform your commits:

```sh
touch file.txt
git add file.txt
bun run commit
```

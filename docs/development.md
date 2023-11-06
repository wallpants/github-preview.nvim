# Development

## ✅ Requirements

-   [x] [Bun](https://bun.sh)
-   [x] [Neovim](https://neovim.io)

## Setup

The following instructions assume the path `~/Projects/nvim-plugins/` exists.
If it doesn't exist, create it or make sure to update relevant commands to
match your file structure.

**1. Clone `github-preview.nvim` to `~/Projects/nvim-plugins/github-preview.nvim`
and install dependencies:**

```sh
cd ~/Projects/nvim-plugins
git clone git@github.com:wallpants/github-preview.nvim.git
cd github-preview.nvim
bun install
```

**2. Install plugin and setup for development in your plugin manager**

Setup [lazy.nvim](https://github.com/folke/lazy.nvim) for plugin development:

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

Install plugin and specify a `log_level` to enable _dev-mode_.

In `github-preview.nvim` _dev-mode_ enables **logging** and _hot-reloading_ of the bun app.

```lua
{
    "wallpants/github-preview.nvim",
    -- if dev = true, lazy will look for plugin in "~/Projects/nvim-plugins"
    dev = true,
    opts = {
        -- set to "debug" to include bunvim's internal logs
        log_level = "debug",
    },
    keys = {
        { "<leader>mpt", "<cmd>GithubPreviewToggle<cr>" }
    },
},
```

**3. Start listening for logs**

Use [bunvim's CLI tool](https://github.com/wallpants/bunvim#console) to listen for logs.

The following command will start a service that will listen for logs.
You can stop the service with `CTRL+C`.

At the repository root `~/Projects/nvim-plugins/github-preview.nvim` run:

```sh
bun run logs
```

You should see no output until the plugin is started in the next step.

**4. Open Neovim and start the plugin**

Open Neovim, load a markdown file into the current buffer and run `:GithubPreviewToggle`

A new tab should open in your browser and logs will be printed both in Neovim and in the
logs process started in the previous step.

Run `:messages` to see what's been printed in Neovim.

Logs that are shown under `:messages` in Neovim, are logs created server-side via
`console.log()`. You can use `console.log()` for quick logs, but as you'll see,
sometimes they're hard to follow/read. For a more complete logging experience, use
[bunvim logging](https://github.com/wallpants/bunvim#%EF%B8%8F-logging).

**5. Start editing server-side code**

You can now start working on **server-side** code.

I haven't fully figured out _hot-reloading_ on **server-side**, so you'll need to
restart the plugin sometimes for your changes to take effect.

Changes to the **webapp** will not be reflected even if you manually refresh
your browser. You'll need to restart the plugin for the **webapp** to update.
Next step enables _hot-reloading_ for the **webapp**.

**6. Start _hot-reloading_ webapp server**

At the repository root `~/Projects/nvim-plugins/github-preview.nvim` run:

```sh
bun run web:dev
```

This will start a [vite dev server](https://vitejs.dev/) and open a new browser
tab where any changes you make to the **webapp** code should be applied live.

Dev logs are printed to your browser's console.

> [!WARNING]
> Vite's dev server handles css post-processing, <strong>bun does not yet</strong>.
>
> This means any changes to tailwind classes are immediately reflected when
> the webapp is served by vite's dev server, but for the changes to be reflected
> when served directly by bun (in production) we need to manually run the command
> `bun run tailwind:compile` to generate required CSS.

## Contributing

🚧 Work in progress

### Commits

### Pull Requests

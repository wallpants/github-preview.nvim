# GitHub Markdown Preview

[<img src="docs/nvim.svg" height="60px" align="right" />](https://neovim.io/)
[<img src="docs/github.svg" height="60px" align="right" />](https://github.com/)
[<img src="docs/bun.svg" height="60px" align="right" />](https://bun.sh/)

Live Preview of your Markdown files & local repositories.

Powered by [Bunvim](https://github.com/wallpants/bunvim) and [Pantsdown](https://github.com/wallpants/pantsdown).

## Features

- [💻 Linux / macOS / WSL](./docs/features.md#linux--macos--wsl)
- [🔴 LIVE updates](./docs/features.md#live-updates)
- [♻ Synced Scrolling](./docs/features.md#synced-scrolling)
- [🖍️ Cursorline in Preview](./docs/features.md#cursorline-in-preview)
- [🏞️ Local Image Support](./docs/features.md#local-image-support)
- [🧜 Mermaid Support](./docs/features.md#mermaid-support)
- [📄 Single-file mode](./docs/features.md#single-file-mode)
- [🗄️ Repository mode](./docs/features.md#repository-mode)

## Demo

![Demo](https://raw.githubusercontent.com/wallpants/gifs/main/github-preview.nvim/demo.gif)

## Requirements

1. [Bun](https://bun.sh)
2. [Neovim](https://neovim.io)

## Installation

Using [lazy.nvim](https://github.com/folke/lazy.nvim)

```lua
{
    'wallpants/github-preview.nvim',
    opts = {
        -- config goes here
    }
    keys = {
        -- optionally, add a keymap
        { "<leader>mp", "<cmd>GithubPreviewToggle<cr>" }
    },
}
```

## Setup

`setup` must be called for the plugin to be loaded. Some plugin managers do this for you.

```lua
require('github-preview').setup({
    -- these are the default values, any values
    -- you specify will be merged with this dictionary

    port = 6041,

    cursor_line = {
        disable = false,

        -- CSS color
        -- if you provide an invalid value, cursorline will be invisible
        color = "rgb(200 100 20 / 0.2)",
    },

    scroll = {
        disable = false,

        -- Between 0 and 100.
        -- Play around with this number until you find the offset you like.
        -- VERY LOW and VERY HIGH numbers might result in cursorline out of screen.
        top_offset_pct = 35,
    },
})
```

## Usage

🚨 The first time you run `:GithubPreviewStart`, it might take a few seconds for your browser to open as dependencies are being downloaded.
This might happen again after a plugin update if there were any changes to the plugin dependencies.

### `:GithubPreviewStart`

Start service. If an instance of **github-preview.nvim** is already running,
be it by the current Neovim instance or another, the older **github-preview.nvim**
is unalived in favour of the younger one.

### `:GithubPreviewStop`

Stops the service. Closes browser tab as well.

### `:GithubPreviewToggle`

Starts the service if not running or stops it if it's already running.

## Roadmap

1. set initial content or first render shows outdated content (23 oct)
2. fix line numbers in code files (23 oct)
3. Better Mermaid support (27 oct)
   - center svgs
   - memoize svgs (this might fix the scroll jumping when mermaid diagrams above cursor line)
   - mermaid dark theme
4. keep track of open and closed \<details> every rerender (23 oct)
   - (quickfix?) add option to in UI to let user select if render all open or all closed (23 oct)
5. implement link follow for local files (23 oct)
6. git hook to compile tailwind (23 oct)
7. write docs (23 oct)
8. write checkhealth (23 oct)

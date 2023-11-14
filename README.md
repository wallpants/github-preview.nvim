# Markdown (GFM) Preview for Neovim

[<img src="docs/nvim.svg" height="60px" align="right" />](https://neovim.io/)
[<img src="docs/github.svg" height="60px" align="right" />](https://github.com/)
[<img src="docs/bun.svg" height="60px" align="right" />](https://bun.sh/)

Live Preview of your GitHub Flavored Markdown files & local git repositories.

Powered by [Bunvim](https://github.com/wallpants/bunvim) and [Pantsdown](https://github.com/wallpants/pantsdown).

![Demo](https://raw.githubusercontent.com/wallpants/gifs/main/github-preview.nvim/demo.gif)

## ✨ Features

-   [💻 Linux / macOS / WSL](/docs/FEATURES.md#-linux--macos--wsl)
-   [🔴 LIVE updates](/docs/FEATURES.md#-live-updates)
-   [♻️ Synced Scrolling](/docs/FEATURES.md#%EF%B8%8F-synced-scrolling)
-   [🌈 Dark & Light modes](/docs/FEATURES.md#-dark--light-modes)
-   [🖍️ Cursorline in Preview](/docs/FEATURES.md#%EF%B8%8F-cursorline-in-preview)
-   [🏞️ Local Image Support](/docs/FEATURES.md#%EF%B8%8F-local-image-support)
-   [🧜 Mermaid Support](/docs/FEATURES.md#-mermaid-support)
-   [📌 Single-file mode](/docs/FEATURES.md#-single-file-mode)
-   [📂 Repository mode](/docs/FEATURES.md#-repository-mode)

## ✅ Requirements

-   [x] [Bun](https://bun.sh)
-   [x] [Neovim](https://neovim.io)

## 📦 Installation

<details>
    <summary>
        Using <a href="https://github.com/folke/lazy.nvim">lazy.nvim</a>
    </summary>

```lua
{
    "wallpants/github-preview.nvim",
    cmd = { "GithubPreviewToggle" },
    keys = { "<leader>mpt" },
    opts = {
        -- config goes here
    },
    config = function(_, opts)
        local gpreview = require("github-preview")
        gpreview.setup(opts)

        local fns = gpreview.fns
        vim.keymap.set("n", "<leader>mpt", fns.toggle)
        vim.keymap.set("n", "<leader>mps", fns.single_file_toggle)
        vim.keymap.set("n", "<leader>mpd", fns.details_tags_toggle)
    end,
}
```

</details>

<details>
    <summary>
        Using <a href="https://github.com/wbthomason/packer.nvim">packer.nvim</a>
    </summary>

```lua
use {
    "wallpants/github-preview.nvim",
    cmd = { "GithubPreviewToggle" },
    keys = { "<leader>mpt" },
    opt = true,
    config = function()
        local gpreview = require("github-preview")
        gpreview.setup({
            -- config goes here
        })

        local fns = gpreview.fns
        vim.keymap.set("n", "<leader>mpt", fns.toggle)
        vim.keymap.set("n", "<leader>mps", fns.single_file_toggle)
        vim.keymap.set("n", "<leader>mpd", fns.details_tags_toggle)
    end,
}
```

</details>

## ⚙️ Configuration

I recommend you start off with the default settings and play around with the UI to figure out
what settings you want to override before committing to updating your config files.

```lua
require("github-preview").setup({
	-- these are the default values,
	-- any values you specify will be merged with this dictionary

	host = "localhost",

	port = 6041,

	-- set to "true" to force single-file mode & disable repository mode
	single_file = false,

	theme = {
		-- "system" | "light" | "dark"
		name = "system",
		high_contrast = false,
	},

	-- define how to render <details> tags on init/content-change
	-- true: <details> tags are rendered open
	-- false: <details> tags are rendered closed
	details_tags_open = true,

	cursor_line = {
		disable = false,

		-- CSS color
		-- if you provide an invalid value, cursorline will be invisible
		color = "#c86414",
		opacity = 0.2,
	},

	scroll = {
		disable = false,

		-- Between 0 and 100
		-- VERY LOW and VERY HIGH numbers might result in cursorline out of screen
		top_offset_pct = 35,
	},

	-- for debugging
	-- nil | "debug" | "verbose"
	log_level = nil,
})
```

## 💻 Usage

🚨 The first time the plugin runs, it might take a few seconds for your browser to open as dependencies are being downloaded.
This might happen again after a plugin update if there were any changes to the plugin dependencies.

### `:GithubPreviewToggle`

**Starts** the plugin if not running or **stops** it if it's already running.

### `:GithubPreviewStart`

**Start** plugin. If the plugin is already running, be it by the current Neovim
instance or another, the older **github-preview.nvim** is unalived in favour of
the younger one.

### `:GithubPreviewStop`

**Stops** the plugin. Closes browser tab as well.

## 🧠 Advanced Usage

This plugin also exports **functions** for you to
[set keymaps](<https://neovim.io/doc/user/lua.html#vim.keymap.set()>),
trigger stuff in [autocommands](<https://neovim.io/doc/user/api.html#nvim_create_autocmd()>),
[create user commands](<https://neovim.io/doc/user/api.html#nvim_create_user_command()>), etc.

### Available functions:

```lua
local gpreview = require("github-preview")
local fns = gpreview.fns

gpreview.setup({ ... })

-- plugin start/stop
fns.toggle()
fns.start()
fns.stop()

-- clear current session's config overrides
-- and fallback to your config files
fns.clear_overrides()

-- single-file mode enable/disable
fns.single_file_toggle()
fns.single_file_on()
fns.single_file_off()

-- render <details> tags open/closed
fns.details_tags_toggle()
fns.details_tags_open()
fns.details_tags_closed()

-- synced scroll enable/disable
fns.scroll_toggle()
fns.scroll_on()
fns.scroll_off()

-- cursorline enable/disable
fns.cursorline_toggle()
fns.cursorline_on()
fns.cursorline_off()
```

## 👷 Development & Contributing

[See documentation](/docs/CONTRIBUTING.md)

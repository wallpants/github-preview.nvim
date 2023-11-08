# GitHub Markdown Preview

[<img src="https://raw.githubusercontent.com/wallpants/github-preview.nvim/main/docs/nvim.svg" height="60px" align="right" />](https://neovim.io/)
[<img src="https://raw.githubusercontent.com/wallpants/github-preview.nvim/main/docs/github.svg" height="60px" align="right" />](https://github.com/)
[<img src="https://raw.githubusercontent.com/wallpants/github-preview.nvim/main/docs/bun.svg" height="60px" align="right" />](https://bun.sh/)

Live Preview of your Markdown files & local git repositories.

Powered by [Bunvim](https://github.com/wallpants/bunvim) and [Pantsdown](https://github.com/wallpants/pantsdown).

![Demo](https://raw.githubusercontent.com/wallpants/gifs/main/github-preview.nvim/demo.gif)

## ✨ Features

-   [💻 Linux / macOS / WSL](https://github.com/wallpants/github-preview.nvim/blob/main/docs/features.md#-linux--macos--wsl)
-   [🔴 LIVE updates](https://github.com/wallpants/github-preview.nvim/blob/main/docs/features.md#-live-updates)
-   [♻️ Synced Scrolling](https://github.com/wallpants/github-preview.nvim/blob/main/docs/features.md#%EF%B8%8F-synced-scrolling)
-   [🌈 Dark & Light modes](https://github.com/wallpants/github-preview.nvim/blob/main/docs/features.md#-dark--light-modes)
-   [🖍️ Cursorline in Preview](https://github.com/wallpants/github-preview.nvim/blob/main/docs/features.md#%EF%B8%8F-cursorline-in-preview)
-   [🏞️ Local Image Support](https://github.com/wallpants/github-preview.nvim/blob/main/docs/features.md#%EF%B8%8F-local-image-support)
-   [🧜 Mermaid Support](https://github.com/wallpants/github-preview.nvim/blob/main/docs/features.md#-mermaid-support)
-   [📄 Single-file mode](https://github.com/wallpants/github-preview.nvim/blob/main/docs/features.md#-single-file-mode)
-   [📂 Repository mode](https://github.com/wallpants/github-preview.nvim/blob/main/docs/features.md#-repository-mode)

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
    -- version = "*", -- latest stable version, may have breaking changes if major version changed
    -- version = "^1.0.0", -- pin major version, include fixes and features that do not have breaking changes
    cmd = { "GithubPreviewToggle" },
    opts = {
        -- config goes here
        -- or empty for default settings
    }
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
    disable = false,
    opt = true,
    cmd = { "GithubPreviewToggle" },
    -- tag = "*", -- latest stable version, may have breaking changes if major version changed
    -- tag = "v1.0.0", -- pin specific tag
    config = function()
        require("github-preview").setup({
            -- config goes here
            -- or empty for default settings
        })
    end,
}
```

</details>

## ⚙️ Configuration

I recommend you start off with the default settings and play around with the UI to figure out
what settings you want to override before committing to updating your config files.

![Config](https://raw.githubusercontent.com/wallpants/gifs/main/github-preview.nvim/config.gif)

```lua
require("github-preview").setup({
	-- these are the default values,
	-- any values you specify will be merged with this dictionary

	-- you can also temporarily override any of these values through the web UI

	host = "localhost",

	port = 6041,

	-- set to "true" to force single-file mode & disable repository mode
	single_file = false,

	-- "system" | "light" | "dark"
	theme = "system",

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

This plugin also exports **functions** for you to do as you please.
You can use them to [set keymaps](<https://neovim.io/doc/user/lua.html#vim.keymap.set()>),
trigger stuff in [autocommands](<https://neovim.io/doc/user/api.html#nvim_create_autocmd()>),
[create user commands](<https://neovim.io/doc/user/api.html#nvim_create_user_command()>),
whatever you can imagine.

<details>
    <summary>
        Example setup with <a href="https://github.com/folke/lazy.nvim">lazy.nvim</a>
    </summary>

```lua
{
    "wallpants/github-preview.nvim",
    keys = { "<leader>mpt" },
    opts = {
        -- your settings
    },
    config = function(_, opts)
        local gpreview = require("github-preview")
        gpreview.setup(opts)

        local fns = gpreview.fns
        vim.keymap.set("n", "<leader>mpt", fns.toggle)
        vim.keymap.set("n", "<leader>mps", fns.scroll_toggle)
        vim.keymap.set("n", "<leader>mpd", fns.details_tags_toggle)
    end,
},
```

</details>

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

[See documentation](https://github.com/wallpants/github-preview.nvim/blob/main/docs/development.md)

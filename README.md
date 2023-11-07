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
    ---@type github_preview_config
    opts = {
        -- config goes here
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
        })
    end,
}
```

</details>

## ⚙️ Configuration

`setup` must be called for the plugin to be loaded. Some plugin managers handle this for you.

```lua
require("github-preview").setup({
	-- these are the default values,
	-- any values you specify will be merged with this dictionary

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

### `:GithubPreviewSingleFileOn`

**Force** single-file mode.

### `:GithubPreviewSingleFileOff`

**Disable** single-file mode. If plugin launched in single-file mode, this won't do anything.
This command only works if plugin launched in repository mode.

### `:GithubPreviewDetailsTagsOpen`

`<details>` tags are rendered **open** on init/content-change.

### `:GithubPreviewDetailsTagsClosed`

`<details>` tags are rendered **closed** on init/content-change.

### `:GithubPreviewScrollOn`

**Enable** synced scrolling.

### `:GithubPreviewScrollOff`

**Disable** synced scrolling.

### `:GithubPreviewCursorlineOn`

**Enable** cursorline.

### `:GithubPreviewCursorlineOff`

**Disable** cursorline.

## 🧠 Advanced Usage

`github-preview.nvim` exports **builtin functions** for you to do as you please.

```lua
local builtin = require("github-preview.builtin")

builtin.start()
builtin.stop()
builtin.toggle()
builtin.single_file_on()
builtin.single_file_off()
builtin.details_tags_open()
builtin.details_tags_closed()
builtin.scroll_on()
builtin.scroll_off()
builtin.cursorline_on()
builtin.cursorline_off()
```

## 👷 Development & Contributing

[See documentation](https://github.com/wallpants/github-preview.nvim/blob/main/docs/development.md)

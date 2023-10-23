# GitHub Markdown Preview

<img src="docs/nvim.svg" height="60px" align="right" />
<img src="docs/github.svg" height="60px" align="right" />
<img src="docs/bun.svg" height="60px" align="right" />

Live Preview of your Markdown files & local repositories.
Powered by [Bunvim](https://github.com/wallpants/bunvim) and [Pantsdown](https://github.com/wallpants/pantsdown).

## Features

- 🔴 LIVE updates
- ♻ Synced Scrolling
- 🖍️ Cursorline in Preview
- 🏞️ Local Image Support
- 📄 Single-file mode
- 🗄️ Repository mode

## Demo

![Demo](https://raw.githubusercontent.com/wallpants/gifs/main/github-preview.nvim/demo.gif)

## Installation

Using [lazy.nvim](https://github.com/folke/lazy.nvim)

```lua
{
    'nvim-telescope/telescope.nvim',
    opts = {}
}
```

## Customization

```lua
require('github-preview.nvim').setup{
    -- these are the default options, any options
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
        -- VERY LOW and VERY HIGH numbers might be out of screen
        top_offset_pct = 35,
    },
}
```

## Usage

### `:GithubPreviewStart`

Start service. If an instance of `github-preview.nvim` is already running,
be it by the current Neovim instance or another, the older `github-preview.nvim`
is unalived in favour of the younger one.

### `:GithubPreviewStop`

Stops the service. Closes browser tab as well.

### `:GithubPreviewToggle`

Starts the service if not running or stops it if it's already running.

## Roadmap

- [ ] fix line numbers in code files
- [ ] parse markdown in webworker (maybe?)
- [ ] recalculate offsets on line count change (throttle maybe?)
- [ ] implement link follow for local files
- [ ] git hook to compile tailwind
- [ ] write docs
- [ ] github removes "style" from html, we do render it
- [ ] write checkhealth

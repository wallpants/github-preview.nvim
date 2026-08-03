---@class init
---@field root string absolute path to the repository root (or single-file's directory)
---@field path string path of the buffer being previewed, relative to root

---Virtual cursorline rendered in the browser preview.
---@class cursor_line
---@field disable boolean | nil disable the cursorline in the preview
---@field color string | nil CSS color, an invalid value renders the cursorline invisible (default: "#c86414")
---@field opacity number | nil between 0 (invisible) and 1 (solid) (default: 0.2)

---Scroll-sync between Neovim and the browser preview.
---@class scroll
---@field disable boolean | nil disable scroll-sync
---@field top_offset_pct number | nil cursorline position as % of window height, between 0 and 100 — very low/high values might push the cursorline off screen (default: 35)

---@class theme
---@field name "system" | "light" | "dark" | nil (default: "system")
---@field high_contrast boolean | nil use high-contrast variant of the theme

---@alias log_level "verbose" | "debug" | "info"

---@class github_preview_config
---@field host string | nil host used by local server (default: "localhost")
---@field port number | nil port used by local server (default: 6041)
---@field allow_multiple_instances boolean | nil true: leave instances started by other Neovim processes running, picking a free port by incrementing "port" — false: starting the plugin kills any other running instance (default: false)
---@field theme theme | nil
---@field single_file boolean | nil force single-file mode & disable repository mode (default: false)
---@field details_tags_open boolean | nil render <details> tags open on init/content-change (default: true)
---@field cursor_line cursor_line | nil
---@field scroll scroll | nil
---@field log_level log_level | nil for debugging (default: nil)

---@class env
---@field LOG_LEVEL log_level | "none"

---@class github_preview_props
---@field init init
---@field config github_preview_config

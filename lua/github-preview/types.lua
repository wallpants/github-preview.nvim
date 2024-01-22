---@class init
---@field root string
---@field path string

---@class env
---@field LOG_LEVEL string?
---@field IS_DEV boolean?

---@class cursor_line
---@field disable boolean | nil
---@field color string | nil
---@field opacity number | nil

---@class scroll
---@field disable boolean | nil
---@field top_offset_pct number | nil

---@class theme
---@field name "system" | "light" | "dark" | nil
---@field high_contrast boolean | nil

---@class github_preview_config
---@field host string | nil
---@field port number | nil
---@field theme theme | nil
---@field single_file boolean | nil
---@field details_tags_open boolean | nil
---@field cursor_line cursor_line | nil
---@field scroll scroll | nil
---@field log_level nil | "verbose" | "debug"

---@class github_preview_props
---@field init init
---@field config github_preview_config

---@class init
---@field root string
---@field path string
---@field lines string[]

---@class cursor_line
---@field disable boolean
---@field color string

---@class scroll
---@field disable boolean
---@field top_offset_pct number

---@class config
---@field host string
---@field port number
---@field single_file boolean
---@field details_tags_open boolean
---@field cursor_line cursor_line
---@field scroll scroll
---@field log_level? string

---@class plugin_props
---@field init init
---@field config config

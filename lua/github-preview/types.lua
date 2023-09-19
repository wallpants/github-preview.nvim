local M = {}

---@class plugin_init
---@field port number
---@field root string
---@field path string
---@field scroll_debounce_ms number
---@field disable_sync_scroll boolean

---@class nvim_plugin_opts
---@field port number
---@field scroll_debounce_ms number
---@field disable_sync_scroll boolean
---@field ignore_buffer_patterns string[]

return M

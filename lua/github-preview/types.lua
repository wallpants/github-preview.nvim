local M = {}

---@enum sync_scroll_type
M.SYNC_SCROLL_TYPE = {
	middle = "middle",
	top = "top",
	relative = "relative",
}

---@class plugin_config
---@field port number
---@field cwd string
---@field scroll_debounce_ms number
---@field disable_sync_scroll boolean
---@field ignore_buffer_patterns string[]
---@field sync_scroll_type sync_scroll_type

---@class opts
---@field dev boolean
---@field port number
---@field scroll_debounce_ms number
---@field disable_sync_scroll boolean
---@field ignore_buffer_patterns string[]
---@field sync_scroll_type sync_scroll_type

---@class cursor_move
---@field cursor_line number
---@field content_len number
---@field win_height number
---@field win_line number
---@field sync_scroll_type sync_scroll_type

return M

local M = {}

---@enum sync_scroll_type
M.SYNC_SCROLL_TYPE = {
	middle = "middle",
	top = "top",
	relative = "relative",
}

---@enum log_output
M.LOG_OUTPUT = {
	none = "none",
	file = "file",
	print = "print",
}

---@class plugin_props
---@field port number
---@field scroll_debounce_ms number
---@field buffer_id number
---@field disable_sync_scroll boolean
---@field sync_scroll_type sync_scroll_type

---@class opts
---@field port number
---@field log_output log_output
---@field scroll_debounce_ms number
---@field disable_sync_scroll boolean
---@field sync_scroll_type sync_scroll_type

return M

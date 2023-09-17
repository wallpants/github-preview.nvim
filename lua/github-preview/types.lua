local M = {}

---@class plugin_init
---@field port number
---@field root string
---@field path string
---@field cursor_line number
---@field scroll_debounce_ms number
---@field disable_sync_scroll boolean

---@class nvim_plugin_opts
---@field port number
---@field scroll_debounce_ms number
---@field disable_sync_scroll boolean
---@field ignore_buffer_patterns string[]

---@class content_change
---@field abs_path string
---@field content string

---@class cursor_move
---@field abs_path string
---@field cursor_line number

---@class autocmd_arg
-- autocommand id
---@field id number
-- expanded value of <amatch>
---@field match string
-- expanded value of <abuf>
---@field buf number
-- absolute file path
---@field file string
-- name of triggered event
---@field event string

return M

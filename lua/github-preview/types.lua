-- cspell:ignore autocmd autocommand amatch abuf
local M = {}

---@enum sync_scroll_type
M.SYNC_SCROLL_TYPE = {
    top = "top",
    middle = "middle",
    bottom = "bottom",
}

-- github-preview/js/server/src/types.ts
---@class plugin_init
---@field port number
---@field root string
---@field path string
---@field content string
---@field scroll_debounce_ms number
---@field disable_sync_scroll boolean
---@field sync_scroll_type sync_scroll_type

---@class nvim_plugin_opts
---@field port number
---@field scroll_debounce_ms number
---@field disable_sync_scroll boolean
---@field ignore_buffer_patterns string[]
---@field sync_scroll_type sync_scroll_type

---@class content_change
---@field content string
---@field abs_path string

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

local Utils = require("markdown-preview.utils")
local Types = require("markdown-preview.types")

local M = {}

---@type opts
M.default_opts = {
	port = 4002,
	log_output = Types.LOG_OUTPUT.none,
	scroll_debounce_ms = 250,
	disable_sync_scroll = false,
	sync_scroll_type = Types.SYNC_SCROLL_TYPE.middle,
}

---@param opts opts
M.setup = function(opts)
	opts = vim.tbl_deep_extend("keep", opts, M.default_opts)

	local function start_server()
		---@type plugin_props
		vim.g.markdown_preview_props = {
			port = opts.port,
			scroll_debounce_ms = opts.scroll_debounce_ms,
			buffer_id = vim.api.nvim_get_current_buf(),
			disable_sync_scroll = false,
			sync_scroll_type = Types.SYNC_SCROLL_TYPE.middle,
		}

		vim.api.nvim_create_autocmd({ "TextChangedI", "TextChanged" }, {
			buffer = 0,
			callback = function(args)
				vim.rpcnotify(0, "markdown-preview-text-changed", args)
			end,
		})

		vim.api.nvim_create_autocmd({ "CursorMovedI", "CursorMoved", "CursorHoldI", "CursorHold" }, {
			buffer = 0,
			callback = function(args)
				vim.rpcnotify(0, "markdown-preview-cursor-moved", args)
			end,
		})

		vim.api.nvim_create_autocmd({ "BufDelete" }, {
			buffer = 0,
			callback = function(args)
				vim.rpcnotify(0, "markdown-preview-buffer-delete", args)
			end,
		})

		---@type string
		local shell_command = "node " .. Utils.plugin_root .. "dist/index.js " .. Utils.nvim_socket

		vim.fn.jobstart(shell_command, {
			on_stdout = Utils.log(opts.log_output, "stdout"),
			on_stderr = Utils.log(opts.log_output, "stderr"),
			on_exit = Utils.log(opts.log_output, "exit"),
		})
	end

	vim.api.nvim_create_user_command("MarkdownPreview", start_server, {})
end

return M

-- cspell:ignore autocmd rpcnotify jobstart
local Utils = require("github-preview.utils")
local Types = require("github-preview.types")

local M = {}

---@type opts
M.default_opts = {
	port = 4002,
	log_output = Types.LOG_OUTPUT.none,
	scroll_debounce_ms = 250,
	disable_sync_scroll = false,
	ignore_buffer_patterns = { "NvimTree_*" },
	sync_scroll_type = Types.SYNC_SCROLL_TYPE.middle,
}

---@param opts opts
M.setup = function(opts)
	opts = vim.tbl_deep_extend("keep", opts, M.default_opts)

	local function start_server()
		---@type plugin_props
		vim.g.markdown_preview_props = {
			port = opts.port,
			log_output = opts.log_output,
			scroll_debounce_ms = opts.scroll_debounce_ms,
			disable_sync_scroll = false,
			ignore_buffer_patterns = opts.ignore_buffer_patterns,
			sync_scroll_type = Types.SYNC_SCROLL_TYPE.middle,
		}

		vim.api.nvim_create_autocmd({ "TextChangedI", "TextChanged" }, {
			callback = function(args)
				vim.rpcnotify(0, "markdown-preview-text-changed", args)
			end,
		})

		vim.api.nvim_create_autocmd({ "CursorMovedI", "CursorMoved", "CursorHoldI", "CursorHold" }, {
			callback = function(args)
				vim.rpcnotify(0, "markdown-preview-cursor-moved", args)
			end,
		})

		vim.api.nvim_create_autocmd({ "BufDelete" }, {
			callback = function(args)
				vim.rpcnotify(0, "markdown-preview-buffer-delete", args)
			end,
		})

		local shell_command = "node " .. Utils.plugin_root .. "dist/index.js " .. Utils.nvim_socket

		vim.fn.jobstart(shell_command, {
			on_stdout = Utils.log(opts.log_output, "stdout"),
		})
	end

	vim.api.nvim_create_user_command("GithubPreview", start_server, {})
end

return M

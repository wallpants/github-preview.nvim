local Utils = require("markdown-preview.utils")

local M = {}

---@class opts
---@field port number
---@field log_output string -- "none" | "file" | "print"
--
---@param opts opts
M.setup = function(opts)
	---@type opts
	local default_opts = {
		port = 4002,
		log_output = "none",
	}
	opts = vim.tbl_deep_extend("keep", opts, default_opts)

	local function start_server()
		-- set vars to be read and used by node-client
		vim.g.markdown_preview_port = opts.port
		vim.g.markdown_preview_buffer_id = vim.api.nvim_get_current_buf()

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

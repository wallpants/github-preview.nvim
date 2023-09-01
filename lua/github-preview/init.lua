-- cspell:ignore autocmd rpcnotify jobstart getcwd getinfo fnamemodify
local Types = require("github-preview.types")

local M = {}

---@type opts
M.default_opts = {
	dev = false,
	port = 4002,
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
			cwd = vim.fn.getcwd(),
			scroll_debounce_ms = opts.scroll_debounce_ms,
			disable_sync_scroll = false,
			ignore_buffer_patterns = opts.ignore_buffer_patterns,
			sync_scroll_type = Types.SYNC_SCROLL_TYPE.middle,
		}

		vim.api.nvim_create_autocmd({ "TextChangedI", "TextChanged" }, {
			callback = function(arg)
				vim.rpcnotify(0, "markdown-preview-content-change", arg)
			end,
		})

		vim.api.nvim_create_autocmd({ "CursorMovedI", "CursorMoved", "CursorHoldI", "CursorHold" }, {
			callback = function(arg)
				---@type cursor_move
				local cursor_move = {
					cursor_line = 0,
					content_len = 0,
					win_height = 0,
					win_line = 0,
					sync_scroll_type = Types.SYNC_SCROLL_TYPE.middle,
				}
				vim.rpcnotify(0, "markdown-preview-cursor-move", arg, cursor_move)
			end,
		})

		-- vim.api.nvim_create_autocmd({ "BufDelete" }, {
		-- 	callback = function(args)
		-- 		vim.rpcnotify(0, "markdown-preview-buffer-delete", args)
		-- 	end,
		-- })

		local current_file_path = debug.getinfo(1, "S").source:sub(2)
		local plugin_root = vim.fn.fnamemodify(current_file_path, ":p:h:h:h") .. "/"

		local base_cmd = opts.dev and "tsx watch " or "node " .. plugin_root

		local server_path = opts.dev and "js/server/src/index.ts " or "js/server/dist/index.js"
		local start_server_cmd = base_cmd .. server_path
		vim.fn.jobstart(start_server_cmd)

		local bridge_path = opts.dev and "js/bridge-neovim/src/index.ts" or "js/bridge-neovim/dist/index.js"
		local start_bridge_cmd = base_cmd .. bridge_path
		vim.fn.jobstart(start_bridge_cmd)
	end

	vim.api.nvim_create_user_command("GithubPreview", start_server, {})
end

return M

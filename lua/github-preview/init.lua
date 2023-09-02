-- cspell:ignore autocmd rpcnotify jobstart getcwd getinfo fnamemodify winline
local Types = require("github-preview.types")

local M = {}

M.log = function(_, data)
	vim.print(data)
end

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

	vim.validate({
		dev = { opts.dev, "boolean" },
		port = { opts.port, "number" },
		scroll_debounce_ms = { opts.scroll_debounce_ms, "number" },
		disable_sync_scroll = { opts.disable_sync_scroll, "boolean" },
		ignore_buffer_patterns = { opts.ignore_buffer_patterns, "table" },
		sync_scroll_type = { opts.sync_scroll_type, "string" },
	})

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
				vim.rpcnotify(0, "github-preview-content-change", arg)
			end,
		})

		vim.api.nvim_create_autocmd({ "CursorMovedI", "CursorMoved", "CursorHoldI", "CursorHold" }, {
			callback = function(arg)
				local cursor = vim.api.nvim_win_get_cursor(0)
				local lines = vim.api.nvim_buf_get_lines(0, 0, -1, true)

				---@type cursor_move
				local cursor_move = {
					cursor_line = cursor[0],
					content_len = #table.concat(lines, "\n"),
					win_height = vim.api.nvim_win_get_height(0),
					win_line = vim.fn.winline(),
					sync_scroll_type = opts.sync_scroll_type,
				}
				vim.rpcnotify(0, "github-preview-cursor-move", arg, cursor_move)
			end,
		})

		local current_file_path = debug.getinfo(1, "S").source:sub(2)
		local plugin_root = vim.fn.fnamemodify(current_file_path, ":p:h:h:h") .. "/"

		local base_cmd = (opts.dev and "tsx watch " or "node ") .. plugin_root
		local bridge_path = opts.dev and "js/bridge-neovim/src/index.ts" or "js/bridge-neovim/dist/index.js"
		local start_bridge_cmd = base_cmd .. bridge_path

		vim.fn.jobstart(start_bridge_cmd)
		-- on_exit = M.log,
		-- on_stderr = M.log,
		-- on_stdout = M.log,
	end

	vim.api.nvim_create_user_command("GithubPreview", start_server, {})
end

return M

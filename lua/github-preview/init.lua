-- cspell:ignore autocmd rpcnotify jobstart getcwd
local Utils = require("github-preview.utils")
local Types = require("github-preview.types")

local M = {}

---@type opts
M.default_opts = {
	dev = false,
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
			cwd = vim.fn.getcwd(),
			scroll_debounce_ms = opts.scroll_debounce_ms,
			disable_sync_scroll = false,
			ignore_buffer_patterns = opts.ignore_buffer_patterns,
			sync_scroll_type = Types.SYNC_SCROLL_TYPE.middle,
		}

		vim.api.nvim_create_autocmd({ "TextChangedI", "TextChanged" }, {
			callback = function(args)
				vim.rpcnotify(0, "markdown-preview-content-change", args)
			end,
		})

		vim.api.nvim_create_autocmd({ "CursorMovedI", "CursorMoved", "CursorHoldI", "CursorHold" }, {
			callback = function(args)
				vim.rpcnotify(0, "markdown-preview-cursor-move", args, { gualberto = "casas" })
			end,
		})

		-- vim.api.nvim_create_autocmd({ "BufDelete" }, {
		-- 	callback = function(args)
		-- 		vim.rpcnotify(0, "markdown-preview-buffer-delete", args)
		-- 	end,
		-- })

		local cmd = opts.dev and "tsx watch " or "node " .. Utils.plugin_root
		-- local gualberto_path = opts.dev and "js/gualberto/src/index.ts " or "js/gualberto/dist/index.js"
		local bridge_path = opts.dev and "js/bridge-neovim/src/index.ts" or "js/bridge-neovim/dist/index.js"
		-- local server_path = opts.dev and "js/server/src/index.ts " or "js/server/dist/index.js"

		-- local start_gualberto_cmd = cmd .. gualberto_path
		local start_bridge_cmd = cmd .. bridge_path
		-- local start_server_cmd = cmd .. server_path

		-- vim.fn.jobstart(start_gualberto_cmd)
		vim.fn.jobstart(start_bridge_cmd)
		-- vim.fn.jobstart(start_server_cmd)
	end

	vim.api.nvim_create_user_command("GithubPreview", start_server, {})
end

return M

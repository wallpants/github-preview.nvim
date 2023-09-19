local M = {}

---@type nvim_plugin_opts
M.default_opts = {
	port = 6041,
	disable_sync_scroll = false,
}

---@param opts nvim_plugin_opts
M.setup = function(opts)
	opts = vim.tbl_deep_extend("keep", opts, M.default_opts)

	vim.validate({
		port = { opts.port, "number" },
		disable_sync_scroll = { opts.disable_sync_scroll, "boolean" },
	})

	local is_dev = os.getenv("VITE_GP_WS_PORT") and true or false

	local function log(_, data)
		if is_dev then
			vim.print(data)
		end
	end

	local function start_server()
		-- should look like "/Users/.../github-preview"
		local root = vim.fn.finddir(".git", ";")

		if root == "" or root == "/" then
			error("root dir with .git not found")
		else
			-- if found, path is made absolute & has "/.git/" popped
			root = vim.fn.fnamemodify(root, ":p:h:h") .. "/"
		end

		local buffer_name = vim.api.nvim_buf_get_name(0)
		local init_path = vim.fn.fnamemodify(buffer_name, ":p")

		---@type plugin_init
		vim.g.github_preview_init = {
			port = opts.port,
			root = root,
			path = init_path,
			disable_sync_scroll = opts.disable_sync_scroll,
		}

		local __filename = debug.getinfo(1, "S").source:sub(2)
		local plugin_root = vim.fn.fnamemodify(__filename, ":p:h:h:h") .. "/"

		local cmd = is_dev and "bun dev" or "bun start"

		vim.fn.jobstart(cmd, {
			cwd = plugin_root .. "typescript/server",
			stdin = "null",
			on_exit = log,
			on_stdout = log,
			on_stderr = log,
		})
	end

	vim.api.nvim_create_user_command("GithubPreview", start_server, {})
end

return M

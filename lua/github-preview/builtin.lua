local Utils = require("github-preview.utils")
local M = {}

M.start = function()
	vim.notify("github-preview: init", vim.log.levels.INFO)

	-- should look like "/Users/.../github-preview"
	local root = vim.fn.finddir(".git", ";")

	local buffer_name = vim.api.nvim_buf_get_name(0)
	local init_path = vim.fn.fnamemodify(buffer_name, ":p")

	if root == "" or Utils.config.single_file then
		-- if repo root not found or single-file mode is enabled,
		-- we make sure there's something loaded into the current buffer
		if vim.fn.fnamemodify(init_path, ":t") == "" then
			vim.notify(
				"github-preview: A file must be loaded into buffer when not in repository mode.",
				vim.log.levels.ERROR
			)
			return
		end
	end

	if root == "" then
		-- if root not found, we set root to current path
		root = vim.fn.fnamemodify(init_path, ":h") .. "/"
		Utils.config.single_file = true
	else
		-- if found, path is made absolute & has "/.git/" popped
		root = vim.fn.fnamemodify(root, ":p:h:h") .. "/"
	end

	---@type plugin_props
	local github_preview_props = {
		init = {
			root = root,
			path = init_path,
		},
		config = Utils.config,
	}
	vim.g.github_preview_props = github_preview_props

	local __filename = debug.getinfo(1, "S").source:sub(2)
	local plugin_root = vim.fn.fnamemodify(__filename, ":p:h:h:h") .. "/"

	-- Install Bun dependencies:
	-- if we try using bun's auto-install feature, web dependencies are not installed,
	-- because they're not imported until the browser makes the initial http request.
	local bun_install = vim.fn.jobstart("bun install --frozen-lockfile --production", {
		cwd = plugin_root,
	})
	vim.fn.jobwait({ bun_install })

	local command = "bun run start"
	local env = { IS_DEV = false }

	-- log level not declared in type, because we don't want users to see it
	---@diagnostic disable-next-line: undefined-field
	if Utils.config.log_level then
		command = "bun --hot run start"
		env.IS_DEV = true
		---@diagnostic disable-next-line: undefined-field
		env.LOG_LEVEL = Utils.config.log_level
	end

	local function log(_, data)
		if env.IS_DEV then
			vim.print(data)
		end
	end

	Utils.job_id = vim.fn.jobstart(command, {
		cwd = plugin_root,
		stdin = "null",
		on_exit = log,
		on_stdout = log,
		on_stderr = log,
		env = env,
	})
end

M.stop = function()
	local channel_id = Utils.get_client_channel()
	if channel_id ~= nil then
		-- onBeforeExit request closes browser
		vim.rpcrequest(channel_id, "on_before_exit")
		if Utils.job_id then
			vim.fn.jobstop(Utils.job_id)
			Utils.job_id = nil
		end
		return true
	end
	return false
end

M.toggle = function()
	if not M.stop() then
		M.start()
	end
end

M.single_file_on = Utils.update_config("single_file_on")
M.single_file_off = Utils.update_config("single_file_off")
M.details_tags_open = Utils.update_config("details_tags_open")
M.details_tags_closed = Utils.update_config("details_tags_closed")
M.scroll_on = Utils.update_config("scroll_on")
M.scroll_off = Utils.update_config("scroll_off")
M.cursorline_on = Utils.update_config("cursorline_on")
M.cursorline_off = Utils.update_config("cursorline_off")

return M

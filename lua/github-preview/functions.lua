local Config = require("github-preview.config")
local Utils = require("github-preview.utils")
local M = {}

M.start = function()
	vim.notify("github-preview: init", vim.log.levels.INFO)

	-- should look like "/Users/.../github-preview"
	local root = Config.value.single_file and "" or vim.fn.finddir(".git", ";")

	local buffer_name = vim.api.nvim_buf_get_name(0)
	local init_path = vim.fn.fnamemodify(buffer_name, ":p")

	if root == "" then
		-- if repo root not found or single-file mode is enabled,
		-- we make sure there's something loaded into the current buffer
		if vim.fn.fnamemodify(init_path, ":t") == "" then
			vim.notify(
				"github-preview: A file must be loaded into buffer when not in repository mode.",
				vim.log.levels.ERROR
			)
			return
		end

		-- if no root, we set root to current path
		root = vim.fn.fnamemodify(init_path, ":h") .. "/"
		Config.value.single_file = true
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
		config = Config.value,
	}
	-- vim.g.github_preview_props is read by bunvim
	vim.g.github_preview_props = github_preview_props

	local __filename = debug.getinfo(1, "S").source:sub(2)
	local plugin_root = vim.fn.fnamemodify(__filename, ":p:h:h:h") .. "/"

	local command = "bun run start"

	---@type env
	local env = { IS_DEV = false }

	if Config.value.log_level then
		command = "bun --hot run start"
		env.IS_DEV = true
		env.LOG_LEVEL = Config.value.log_level
	end

	-- Install Bun dependencies:
	-- if we try using bun's auto-install feature, web dependencies are not installed,
	-- because they're not imported until the browser makes the initial http request.
	local bun_install = vim.fn.jobstart("bun install --frozen-lockfile --production", {
		cwd = plugin_root,
		on_exit = Utils.log_exit(env.LOG_LEVEL),
		on_stdout = Utils.log_job(env.LOG_LEVEL),
		on_stderr = Utils.log_job(env.LOG_LEVEL),
	})
	vim.fn.jobwait({ bun_install })

	Config.job_id = vim.fn.jobstart(command, {
		cwd = plugin_root,
		stdin = "null",
		on_exit = Utils.log_exit(env.LOG_LEVEL),
		on_stdout = Utils.log_job(env.LOG_LEVEL),
		on_stderr = Utils.log_job(env.LOG_LEVEL),
		env = env,
	})
end

M.stop = function()
	local channel_id = Utils.get_client_channel()
	if channel_id ~= nil then
		-- onBeforeExit request closes browser
		vim.rpcrequest(channel_id, "on_before_exit")
		if Config.job_id then
			vim.fn.jobstop(Config.job_id)
			Config.job_id = nil
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

---@param update_action string
---@param value? string
local function update_config(update_action, value)
	return function()
		local channel_id = Utils.get_client_channel()
		if channel_id ~= nil then
			-- vim.rpcrequest seems to be incorrecly typed
			---@diagnostic disable-next-line: param-type-mismatch
			vim.rpcrequest(channel_id, "on_config_update", update_action, value)
		else
			vim.notify("github-preview: could not find running plugin")
		end
	end
end

M.clear_overrides = update_config("clear_overrides")

M.single_file_toggle = update_config("single_file", "toggle")
M.single_file_on = update_config("single_file", "on")
M.single_file_off = update_config("single_file", "off")

M.details_tags_toggle = update_config("details_tags", "toggle")
M.details_tags_open = update_config("details_tags", "open")
M.details_tags_closed = update_config("details_tags", "closed")

M.scroll_toggle = update_config("scroll", "toggle")
M.scroll_on = update_config("scroll", "on")
M.scroll_off = update_config("scroll", "off")

M.cursorline_toggle = update_config("cursorline", "toggle")
M.cursorline_on = update_config("cursorline", "on")
M.cursorline_off = update_config("cursorline", "off")

return M

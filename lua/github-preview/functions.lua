local Config = require("github-preview.config")
local Utils = require("github-preview.utils")
local M = {}

local MIN_BUN_MAJOR = 1
local MIN_BUN_MINOR = 3

M.start = function()
	local min_bun_version = string.format("%d.%d", MIN_BUN_MAJOR, MIN_BUN_MINOR)

	-- Check if bun is installed
	if vim.fn.executable("bun") ~= 1 then
		vim.notify(
			"github-preview: Bun is not installed. Please install Bun >= " .. min_bun_version .. " from https://bun.sh",
			vim.log.levels.ERROR
		)
		return
	end

	-- Check bun version meets minimum requirement
	local bun_version_output = vim.fn.system("bun --version")
	local major, minor = bun_version_output:match("(%d+)%.(%d+)")
	if not major or not minor then
		vim.notify(
			"github-preview: Could not determine Bun version. Please ensure Bun >= "
				.. min_bun_version
				.. " is installed.",
			vim.log.levels.ERROR
		)
		return
	end

	major, minor = tonumber(major), tonumber(minor)
	if major < MIN_BUN_MAJOR or (major == MIN_BUN_MAJOR and minor < MIN_BUN_MINOR) then
		vim.notify(
			string.format("github-preview: Bun %d.%d found, but >= %s is required.", major, minor, min_bun_version),
			vim.log.levels.ERROR
		)
		return
	end

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

	---@type github_preview_props
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

	-- Install Bun dependencies:
	-- if we try using bun's auto-install feature, web dependencies are not installed,
	-- because they're not imported until the browser makes the initial http request.
	local bun_install = vim.fn.jobstart("bun install --production", {
		cwd = plugin_root,
		on_exit = Utils.log_exit(Config.value.log_level),
		on_stdout = Utils.log_job(Config.value.log_level),
		on_stderr = Utils.log_job(Config.value.log_level),
	})
	vim.fn.jobwait({ bun_install })

	local command = Config.value.log_level and "bun --hot run app/index.ts" or "bun run app/index.ts"

	vim.notify("github-preview: init", vim.log.levels.INFO)

	Config.job_id = vim.fn.jobstart(command, {
		cwd = plugin_root,
		stdin = "null",
		on_exit = Utils.log_exit(Config.value.log_level),
		on_stdout = Utils.log_job(Config.value.log_level),
		on_stderr = Utils.log_job(Config.value.log_level),
		-- LOG_LEVEL must always be defined, if it's not bun
		-- doesn't replace process.env.LOG_LEVEL in the webapp
		-- and everything crashes
		env = { LOG_LEVEL = Config.value.log_level or "none" },
	})
end

M.stop = function()
	local channel_id = Utils.get_client_channel()
	if channel_id ~= nil then
		-- before_exit request closes browser
		vim.rpcrequest(channel_id, "before_exit")
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
			vim.rpcrequest(channel_id, "config_update", update_action, value)
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

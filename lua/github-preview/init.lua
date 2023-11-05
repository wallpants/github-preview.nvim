local Utils = require("github-preview.utils")
local M = {}

---@param config config
M.setup = function(config)
	-- deep merge user opts with default opts without overriding user opts
	config = vim.tbl_deep_extend("keep", config, Utils.default_config)
	Utils.validate_config(config)

	local job_id = nil

	local function stop_service()
		if job_id ~= nil then
			local channel_id = Utils.get_client_channel("github-preview")
			if channel_id == nil then
				return
			end
			-- onBeforeExit request closes browser
			vim.rpcrequest(channel_id, "onBeforeExit")
			local stopSuccess = vim.fn.jobstop(job_id)
			if stopSuccess then
				job_id = nil
			else
				vim.notify("github-preview: invalid job_id", vim.log.levels.ERROR)
			end
		end
	end

	local function start_service()
		vim.notify("github-preview: init", vim.log.levels.INFO)

		-- should look like "/Users/.../github-preview"
		local root = vim.fn.finddir(".git", ";")

		local buffer_name = vim.api.nvim_buf_get_name(0)
		local init_path = vim.fn.fnamemodify(buffer_name, ":p")

		if root == "" or config.single_file then
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
			config.single_file = true
		else
			-- if found, path is made absolute & has "/.git/" popped
			root = vim.fn.fnamemodify(root, ":p:h:h") .. "/"
		end

		---@type plugin_props
		vim.g.github_preview_props = {
			init = {
				root = root,
				path = init_path,
			},
			config = config,
		}

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

		if config.log_level then
			command = "bun --hot run start"
			env.IS_DEV = true
			env.LOG_LEVEL = config.log_level
		end

		local function log(_, data)
			if env.IS_DEV then
				vim.print(data)
			end
		end

		job_id = vim.fn.jobstart(command, {
			cwd = plugin_root,
			stdin = "null",
			on_exit = log,
			on_stdout = log,
			on_stderr = log,
			env = env,
		})
	end

	local function toggle_service()
		if job_id ~= nil then
			stop_service()
		else
			start_service()
		end
	end

	vim.api.nvim_create_user_command("GithubPreviewStop", stop_service, {})
	vim.api.nvim_create_user_command("GithubPreviewStart", start_service, {})
	vim.api.nvim_create_user_command("GithubPreviewToggle", toggle_service, {})
end

return M

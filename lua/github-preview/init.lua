local M = {}

---@type config
local default_config = {
	host = "localhost",
	port = 6041,
	single_file = false,
	cursor_line = {
		disable = false,
		color = "rgb(200 100 20 / 0.2)",
	},
	scroll = {
		disable = false,
		top_offset_pct = 35,
	},
}

---@param client_name string
local function client_channel(client_name)
	for _, chan in ipairs(vim.api.nvim_list_chans()) do
		if chan.client and chan.client.name == client_name then
			return chan.id
		end
	end

	vim.notify("github-preview: channel_id not found", vim.log.levels.ERROR)
	return nil
end

---@param config config
M.setup = function(config)
	-- deep merge user opts with default opts without overriding user opts
	config = vim.tbl_deep_extend("keep", config, default_config)

	vim.validate({
		host = { config.host, "string" },
		port = { config.port, "number" },
		["cursor_line.color"] = { config.cursor_line.color, "string" },
		["cursor_line.disable"] = { config.cursor_line.disable, "boolean" },
		["scroll.disable"] = { config.scroll.disable, "boolean" },
		["scroll.top_offset_pct"] = {
			config.scroll.top_offset_pct,
			function(pct)
				return (type(pct) == "number") and (pct >= 0) and (pct <= 100)
			end,
			"number between 0 and 100",
		},
	})

	local job_id = nil

	local function stop_service()
		if job_id ~= nil then
			local channel_id = client_channel("github-preview")
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

		if root == "" then
			if vim.fn.fnamemodify(init_path, ":t") == "" then
				vim.notify(
					"github-preview: A file must be loaded into buffer if not in a git repo",
					vim.log.levels.ERROR
				)
				return
			end
			-- if root not found, we set root to current path
			root = vim.fn.fnamemodify(init_path, ":h")
			config.single_file = true
		else
			-- if found, path is made absolute & has "/.git/" popped
			root = vim.fn.fnamemodify(root, ":p:h:h") .. "/"
		end

		local lines = vim.api.nvim_buf_get_lines(0, 0, -1, true)

		---@type plugin_props
		vim.g.github_preview_props = {
			init = {
				root = root,
				path = init_path,
				lines = lines,
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

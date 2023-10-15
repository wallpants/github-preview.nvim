local M = {}

---@class scroll
---@field disable boolean
---@field top_offset_pct number

---@class cursor_line
---@field disable boolean
---@field color string

---@class plugin_init
---@field port number
---@field root string
---@field path string
---@field single_file boolean
---@field scroll scroll
---@field cursor_line cursor_line

---@class nvim_plugin_opts
---@field port number
---@field scroll scroll
---@field cursor_line cursor_line

---@type nvim_plugin_opts
M.default_opts = {
	port = 6041,
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

---@param opts nvim_plugin_opts
M.setup = function(opts)
	-- deep merge user opts with default opts without overriding user opts
	opts = vim.tbl_deep_extend("keep", opts, M.default_opts)

	vim.validate({
		port = { opts.port, "number" },
		["cursor_line.color"] = { opts.cursor_line.color, "string" },
		["cursor_line.disable"] = { opts.cursor_line.disable, "boolean" },
		["scroll.disable"] = { opts.scroll.disable, "boolean" },
		["scroll.top_offset_pct"] = {
			opts.scroll.top_offset_pct,
			function(pct)
				return (type(pct) == "number") and (pct >= 0) and (pct <= 100)
			end,
			"number between 0 and 100",
		},
	})

	local is_dev = os.getenv("GP_LOG_LEVEL") and true or false

	local function log(_, data)
		if is_dev then
			vim.print(data)
		end
	end

	local job_id = nil

	local function stop_service()
		if job_id ~= nil then
			local channel_id = client_channel("github-preview")
			if channel_id == nil then
				return
			end
			-- VimLeavePre request closes browser
			vim.rpcrequest(channel_id, "VimLeavePre")
			local stopSuccess = vim.fn.jobstop(job_id)
			if stopSuccess then
				job_id = nil
			else
				vim.notify("github-preview: invalid job_id", vim.log.levels.ERROR)
			end
		end
	end

	local function start_service()
		-- stop service if it's already running and we try starting it again
		stop_service()

		-- should look like "/Users/.../github-preview"
		local root = vim.fn.finddir(".git", ";")
		local single_file = false

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
			single_file = true
		else
			-- if found, path is made absolute & has "/.git/" popped
			root = vim.fn.fnamemodify(root, ":p:h:h") .. "/"
		end

		---@type plugin_init
		vim.g.github_preview_init = {
			port = opts.port,
			root = root,
			path = init_path,
			single_file = single_file,
			scroll = opts.scroll,
			cursor_line = opts.cursor_line,
		}

		local __filename = debug.getinfo(1, "S").source:sub(2)
		local plugin_root = vim.fn.fnamemodify(__filename, ":p:h:h:h") .. "/"

		-- install bun dependencies
		local bun_install = vim.fn.jobstart("bun install --frozen-lockfile --production", {
			cwd = plugin_root .. "app",
		})
		vim.fn.jobwait({ bun_install })

		local cmd = is_dev and "bun dev" or "bun start"

		job_id = vim.fn.jobstart(cmd, {
			cwd = plugin_root .. "app",
			stdin = "null",
			on_exit = log,
			on_stdout = log,
			on_stderr = log,
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

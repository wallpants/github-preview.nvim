local M = {}

M.job_id = nil

---@type github_preview_config
M.config = {
	-- these are the default values,
	-- any values you specify will be merged with this dictionary

	host = "localhost",

	port = 6041,

	-- set to "true" to force single-file mode & disable repository mode
	single_file = false,

	theme = {
		-- "system" | "light" | "dark"
		name = "system",
		high_contrast = false,
	},

	-- define how to render <details> tags on init/content-change
	-- true: <details> tags are rendered open
	-- false: <details> tags are rendered closed
	details_tags_open = true,

	cursor_line = {
		disable = false,

		-- CSS color
		-- if you provide an invalid value, cursorline will be invisible
		color = "#c86414",
		opacity = 0.2,
	},

	scroll = {
		disable = false,

		-- Between 0 and 100
		-- VERY LOW and VERY HIGH numbers might result in cursorline out of screen
		top_offset_pct = 35,
	},

	-- for debugging
	-- nil | "debug" | "verbose"
	log_level = nil,
}

M.get_client_channel = function()
	for _, chan in ipairs(vim.api.nvim_list_chans()) do
		if chan.client and chan.client.name == "github-preview" then
			return chan.id
		end
	end

	return nil
end

M.validate_config = function()
	vim.validate({
		host = { M.config.host, "string" },
		port = { M.config.port, "number" },
		["theme.high_contrast"] = { M.config.theme.high_contrast, "boolean" },
		["theme.name"] = {
			M.config.theme.name,
			function(theme)
				return (type(theme) == "string") and ((theme == "system") or (theme == "light") or (theme == "dark"))
			end,
			'theme must be "system", "light" or "dark"',
		},
		single_file = { M.config.single_file, "boolean" },
		details_tags_open = { M.config.details_tags_open, "boolean" },
		["cursor_line.color"] = { M.config.cursor_line.color, "string" },
		["cursor_line.opacity"] = { M.config.cursor_line.opacity, "number" },
		["cursor_line.disable"] = { M.config.cursor_line.disable, "boolean" },
		["scroll.disable"] = { M.config.scroll.disable, "boolean" },
		["scroll.top_offset_pct"] = {
			M.config.scroll.top_offset_pct,
			function(pct)
				return (type(pct) == "number") and (pct >= 0) and (pct <= 100)
			end,
			"number between 0 and 100",
		},
		log_level = {
			M.config.log_level,
			function(log_level)
				local is_nil = type(log_level) == "nil"
				local is_valid = (type(log_level) == "string") and ((log_level == "debug") or (log_level == "verbose"))
				return is_nil or is_valid
			end,
			'log_level must be nil, "debug" or "verbose"',
		},
	})
end

---@param log_level string
M.log_exit = function(log_level)
	if not log_level then
		return
	end
	return function(job_id, exit_code)
		vim.print("++++++++++++++++")
		vim.print("job# " .. job_id .. ":")
		vim.print("exit_code: " .. exit_code)
	end
end

---@param log_level string
M.log_job = function(log_level)
	-- https://neovim.io/doc/user/channel.html#channel-bytes
	if not log_level then
		return
	end
	local lines = { "" }
	return function(job_id, data)
		local eof = #data > 0 and data[#data] == ""
		lines[#lines] = lines[#lines] .. data[1]
		for i = 2, #data do
			table.insert(lines, data[i])
		end
		if eof then
			vim.print("----------------")
			vim.print("job# " .. job_id .. ":")
			for _, line in ipairs(lines) do
				vim.print(line)
			end
			lines = { "" }
		end
	end
end

---@param update_action string
---@param value? string
M.update_config = function(update_action, value)
	return function()
		local channel_id = M.get_client_channel()
		if channel_id ~= nil then
			-- vim.rpcrequest seems to be incorrecly typed
			---@diagnostic disable-next-line: param-type-mismatch
			vim.rpcrequest(channel_id, "on_config_update", update_action, value)
		else
			vim.notify("github-preview: could not find running plugin")
		end
	end
end

return M

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

	-- "system" | "light" | "dark"
	theme = "system",

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
		theme = {
			M.config.theme,
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
	})
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

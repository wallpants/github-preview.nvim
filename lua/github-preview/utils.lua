local M = {}

---@param client_name string
M.get_client_channel = function(client_name)
	for _, chan in ipairs(vim.api.nvim_list_chans()) do
		if chan.client and chan.client.name == client_name then
			return chan.id
		end
	end

	vim.notify("github-preview: channel_id not found", vim.log.levels.ERROR)
	return nil
end

---@param config config
M.validate_config = function(config)
	vim.validate({
		host = { config.host, "string" },
		port = { config.port, "number" },
		theme = {
			config.theme,
			function(theme)
				return (type(theme) == "string") and ((theme == "system") or (theme == "light") or (theme == "dark"))
			end,
			'theme must be "system", "light" or "dark"',
		},
		single_file = { config.single_file, "boolean" },
		details_tags_open = { config.details_tags_open, "boolean" },
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
end

---@type config
M.default_config = {
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

return M

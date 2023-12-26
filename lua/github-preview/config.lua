local M = {}

M.job_id = nil

---@type github_preview_config
M.value = {
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

M.validate = function()
	vim.validate({
		host = { M.value.host, "string" },
		port = { M.value.port, "number" },
		["theme.high_contrast"] = { M.value.theme.high_contrast, "boolean" },
		["theme.name"] = {
			M.value.theme.name,
			function(theme)
				return (type(theme) == "string") and ((theme == "system") or (theme == "light") or (theme == "dark"))
			end,
			'theme must be "system", "light" or "dark"',
		},
		single_file = { M.value.single_file, "boolean" },
		details_tags_open = { M.value.details_tags_open, "boolean" },
		["cursor_line.color"] = { M.value.cursor_line.color, "string" },
		["cursor_line.opacity"] = { M.value.cursor_line.opacity, "number" },
		["cursor_line.disable"] = { M.value.cursor_line.disable, "boolean" },
		["scroll.disable"] = { M.value.scroll.disable, "boolean" },
		["scroll.top_offset_pct"] = {
			M.value.scroll.top_offset_pct,
			function(pct)
				return (type(pct) == "number") and (pct >= 0) and (pct <= 100)
			end,
			"number between 0 and 100",
		},
		log_level = {
			M.value.log_level,
			function(log_level)
				local is_nil = type(log_level) == "nil"
				local is_valid = (type(log_level) == "string") and ((log_level == "debug") or (log_level == "verbose"))
				return is_nil or is_valid
			end,
			'log_level must be nil, "debug" or "verbose"',
		},
	})
end

return M

---@return table
local function fresh_config()
	package.loaded["github-preview.config"] = nil
	return require("github-preview.config")
end

describe("config", function()
	it("default config passes validation", function()
		local config = fresh_config()
		assert.has_no.errors(config.validate)
	end)

	it("rejects invalid theme name", function()
		local config = fresh_config()
		config.value.theme.name = "solarized"
		assert.has_error(config.validate)
	end)

	it("rejects non-number port", function()
		local config = fresh_config()
		config.value.port = "6041"
		assert.has_error(config.validate)
	end)

	it("rejects scroll.top_offset_pct outside 0-100", function()
		local config = fresh_config()
		config.value.scroll.top_offset_pct = 101
		assert.has_error(config.validate)

		config = fresh_config()
		config.value.scroll.top_offset_pct = -1
		assert.has_error(config.validate)
	end)

	it("accepts valid log_levels", function()
		for _, log_level in ipairs({ "debug", "verbose", "info" }) do
			local config = fresh_config()
			config.value.log_level = log_level
			assert.has_no.errors(config.validate)
		end
	end)

	it("rejects invalid log_level", function()
		local config = fresh_config()
		config.value.log_level = "trace"
		assert.has_error(config.validate)
	end)

	it("rejects non-boolean single_file", function()
		local config = fresh_config()
		config.value.single_file = "yes"
		assert.has_error(config.validate)
	end)
end)

local function fresh_plugin()
	package.loaded["github-preview"] = nil
	package.loaded["github-preview.config"] = nil
	package.loaded["github-preview.functions"] = nil
	return require("github-preview")
end

describe("setup", function()
	it("merges partial config with defaults", function()
		local github_preview = fresh_plugin()
		github_preview.setup({
			port = 1234,
			theme = { name = "dark" },
		})

		local config = require("github-preview.config")
		-- overridden values
		assert.equals(1234, config.value.port)
		assert.equals("dark", config.value.theme.name)
		-- untouched defaults
		assert.equals("localhost", config.value.host)
		assert.is_false(config.value.theme.high_contrast)
		assert.is_true(config.value.details_tags_open)
	end)

	it("works without arguments", function()
		local github_preview = fresh_plugin()
		assert.has_no.errors(github_preview.setup)

		local config = require("github-preview.config")
		assert.equals("localhost", config.value.host)
		assert.equals(6041, config.value.port)
	end)

	it("creates user commands", function()
		local github_preview = fresh_plugin()
		github_preview.setup({})

		local commands = vim.api.nvim_get_commands({})
		assert.is_not_nil(commands.GithubPreviewStart)
		assert.is_not_nil(commands.GithubPreviewStop)
		assert.is_not_nil(commands.GithubPreviewToggle)
	end)

	it("errors on invalid partial config", function()
		local github_preview = fresh_plugin()
		assert.has_error(function()
			github_preview.setup({ theme = { name = "solarized" } })
		end)
	end)

	it("exposes functions", function()
		local github_preview = fresh_plugin()
		assert.equals("function", type(github_preview.fns.start))
		assert.equals("function", type(github_preview.fns.stop))
		assert.equals("function", type(github_preview.fns.toggle))
		assert.equals("function", type(github_preview.fns.scroll_toggle))
		assert.equals("function", type(github_preview.fns.cursorline_toggle))
		assert.equals("function", type(github_preview.fns.single_file_toggle))
		assert.equals("function", type(github_preview.fns.details_tags_toggle))
		assert.equals("function", type(github_preview.fns.clear_overrides))
	end)
end)

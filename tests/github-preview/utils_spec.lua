local utils = require("github-preview.utils")

describe("get_client_channel", function()
	it("returns nil when no github-preview client is attached", function()
		assert.is_nil(utils.get_client_channel())
	end)
end)

describe("log_exit", function()
	it("returns nil when log_level is nil", function()
		assert.is_nil(utils.log_exit(nil))
	end)

	it("returns a callback when log_level is set", function()
		assert.equals("function", type(utils.log_exit("debug")))
	end)
end)

describe("log_job", function()
	it("returns nil when log_level is nil", function()
		assert.is_nil(utils.log_job(nil))
	end)

	it("buffers partial lines and prints on eof", function()
		local printed = {}
		local original_print = vim.print
		---@diagnostic disable-next-line: duplicate-set-field
		vim.print = function(value)
			table.insert(printed, value)
		end

		local on_data = utils.log_job("debug")
		assert.is_not_nil(on_data)

		-- https://neovim.io/doc/user/channel.html#channel-bytes
		-- streams send partial lines; a trailing "" marks eof
		on_data(7, { "hel" })
		assert.equals(0, #printed)

		on_data(7, { "lo world", "second line", "" })
		vim.print = original_print

		assert.equals("job# 7:", printed[2])
		assert.equals("hello world", printed[3])
		assert.equals("second line", printed[4])
	end)
end)

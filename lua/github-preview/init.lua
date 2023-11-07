local Utils = require("github-preview.utils")
local Builtin = require("github-preview.builtin")
local M = {}

---@param config config
M.setup = function(config)
	-- deep merge user opts with default opts without overriding user opts
	Utils.config = vim.tbl_deep_extend("keep", config, Utils.config)
	Utils.validate_config()

	vim.api.nvim_create_user_command("GithubPreviewStop", Builtin.stop, {})
	vim.api.nvim_create_user_command("GithubPreviewStart", Builtin.start, {})
	vim.api.nvim_create_user_command("GithubPreviewToggle", Builtin.toggle, {})
end

return M

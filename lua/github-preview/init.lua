local Utils = require("github-preview.utils")
local Fns = require("github-preview.functions")

local M = {}

---@param partial_config github_preview_config
M.setup = function(partial_config)
	-- deep merge user opts with default opts without overriding user opts
	Utils.config = vim.tbl_deep_extend("force", Utils.config, partial_config)
	Utils.validate_config()

	vim.api.nvim_create_user_command("GithubPreviewStop", Fns.stop, {})
	vim.api.nvim_create_user_command("GithubPreviewStart", Fns.start, {})
	vim.api.nvim_create_user_command("GithubPreviewToggle", Fns.toggle, {})
end

M.fns = Fns

return M

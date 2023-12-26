local Config = require("github-preview.config")
local Fns = require("github-preview.functions")

local M = {}

---@param partial_config github_preview_config
M.setup = function(partial_config)
	Config.value = vim.tbl_deep_extend("force", Config.value, partial_config)
	Config.validate()

	vim.api.nvim_create_user_command("GithubPreviewStop", Fns.stop, {})
	vim.api.nvim_create_user_command("GithubPreviewStart", Fns.start, {})
	vim.api.nvim_create_user_command("GithubPreviewToggle", Fns.toggle, {})
end

M.fns = Fns

return M

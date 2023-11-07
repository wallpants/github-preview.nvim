local Utils = require("github-preview.utils")
local Builtin = require("github-preview.builtin")

local M = {}

---@param partial_config github_preview_config
M.setup = function(partial_config)
	-- deep merge user opts with default opts without overriding user opts
	Utils.config = vim.tbl_deep_extend("force", Utils.config, partial_config)
	Utils.validate_config()

	vim.api.nvim_create_user_command("GithubPreviewStop", Builtin.stop, {})
	vim.api.nvim_create_user_command("GithubPreviewStart", Builtin.start, {})
	vim.api.nvim_create_user_command("GithubPreviewToggle", Builtin.toggle, {})
	vim.api.nvim_create_user_command("GithubPreviewSingleFileOn", Builtin.single_file_on, {})
	vim.api.nvim_create_user_command("GithubPreviewSingleFileOff", Builtin.single_file_off, {})
	vim.api.nvim_create_user_command("GithubPreviewDetailsTagsOpen", Builtin.details_tags_open, {})
	vim.api.nvim_create_user_command("GithubPreviewDetailsTagsClosed", Builtin.details_tags_closed, {})
	vim.api.nvim_create_user_command("GithubPreviewScrollOn", Builtin.scroll_on, {})
	vim.api.nvim_create_user_command("GithubPreviewScrollOff", Builtin.scroll_off, {})
	vim.api.nvim_create_user_command("GithubPreviewCursorlineOn", Builtin.cursorline_on, {})
	vim.api.nvim_create_user_command("GithubPreviewCursorlineOff", Builtin.cursorline_off, {})
end

return M

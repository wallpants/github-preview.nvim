local Utils = require("github-preview.utils")
local M = {}

---@param update_action "single_file_enable" |  "single_file_disable" |  "details_tags_open" |  "details_tags_closed" |  "scroll_enable" |  "scroll_disable" |  "cursorline_enable" |  "cursorline_disable"
local function update_config(update_action)
	return function()
		local channel_id = Utils.get_client_channel("github-preview")
		if channel_id ~= nil then
			-- vim.rpcrequest seems to be incorrecly typed
			---@diagnostic disable-next-line: param-type-mismatch
			vim.rpcrequest(channel_id, "onConfigUpdate", update_action)
		else
			vim.notify("github-preview: could not find running plugin")
		end
	end
end

M.single_file_enable = update_config("single_file_enable")
M.single_file_disable = update_config("single_file_disable")
M.details_tags_open = update_config("details_tags_open")
M.details_tags_closed = update_config("details_tags_closed")
M.scroll_enable = update_config("scroll_enable")
M.scroll_disable = update_config("scroll_disable")
M.cursorline_enable = update_config("cursorline_enable")
M.cursorline_disable = update_config("cursorline_disable")

return M

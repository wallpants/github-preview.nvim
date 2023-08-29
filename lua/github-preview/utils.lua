local Types = require("github-preview.types")

local M = {}

local current_file_path = debug.getinfo(1, "S").source:sub(2)

M.plugin_root = vim.fn.fnamemodify(current_file_path, ":p:h:h:h") .. "/"

---@type string
M.nvim_socket = vim.fn.serverlist()[1]

---@param log_output log_output
---@param source string
---@return fun(_: any, data: string[])
M.log = function(log_output, source)
	return function(_, data)
		-- log to statusline
		if log_output == Types.LOG_OUTPUT.print then
			for _, line in pairs(data) do
				print(line)
			end
		end

		-- log to file
		if log_output == Types.LOG_OUTPUT.file then
			local file = io.open(M.plugin_root .. source .. ".log", "a")
			if file then
				for _, line in pairs(data) do
					file:write(line .. "\n")
				end
				file:close()
			end
		end
	end
end

return M

local M = {}

local current_file_path = debug.getinfo(1, "S").source:sub(2)

M.plugin_root = vim.fn.fnamemodify(current_file_path, ":p:h:h:h") .. "/"

M.nvim_socket = vim.fn.serverlist()[1]

---@param log_output string
---@param source string
M.log = function(log_output, source)
	return function(_, data)
		if log_output == "print" then
			print(source .. vim.inspect(data))
		end
		if log_output == "file" then
			local file = io.open(M.plugin_root .. source .. ".log", "a")
			if file then
				file:write(vim.inspect(data) .. "\n")
				file:close()
			end
		end
	end
end

return M

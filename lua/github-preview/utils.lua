local M = {}

M.get_client_channel = function()
	for _, chan in ipairs(vim.api.nvim_list_chans()) do
		if chan.client and chan.client.name == "github-preview" then
			return chan.id
		end
	end

	return nil
end

---@param log_level string
M.log_exit = function(log_level)
	if not log_level then
		return
	end
	return function(job_id, exit_code)
		vim.print("++++++++++++++++")
		vim.print("job# " .. job_id .. ":")
		vim.print("exit_code: " .. exit_code)
	end
end

---@param log_level string
M.log_job = function(log_level)
	-- https://neovim.io/doc/user/channel.html#channel-bytes
	if not log_level then
		return
	end
	local lines = { "" }
	return function(job_id, data)
		local eof = #data > 0 and data[#data] == ""
		lines[#lines] = lines[#lines] .. data[1]
		for i = 2, #data do
			table.insert(lines, data[i])
		end
		if eof then
			vim.print("----------------")
			vim.print("job# " .. job_id .. ":")
			for _, line in ipairs(lines) do
				vim.print(line)
			end
			lines = { "" }
		end
	end
end

return M

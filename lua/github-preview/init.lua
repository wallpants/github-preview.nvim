local M = {}

M.log = function(_, data)
	vim.print(data)
end

M.setup = function()
	local function start_server()
		vim.print("start_server")

		vim.g.github_preview_init = {
			gualberto = "casas",
		}

		local __filename = debug.getinfo(1, "S").source:sub(2)
		local plugin_root = vim.fn.fnamemodify(__filename, ":p:h:h:h") .. "/"

		local cmd = "bun dev"

		vim.fn.jobstart(cmd, {
			cwd = plugin_root .. "typescript/neovim-bridge",
			stderr_buffered = false,
			stdout_buffered = false,
			stdin = "null",
			on_exit = M.log,
			on_stdout = M.log,
			on_stderr = M.log,
		})
	end

	vim.api.nvim_create_user_command("GithubPreview", start_server, {})
end

return M

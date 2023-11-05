local M = {}

local get_platform = function()
	local os_name = vim.loop.os_uname().sysname
	if os_name == "Windows" then
		return "win"
	elseif os_name == "Darwin" then
		local arch = vim.fn.system("arch")
		if string.match(arch, "arm64") then
			return "macos-arm64"
		end
		return "macos"
	end
	return "linux"
end

---@param command string
local run_command = function(command)
	local output = vim.fn.system(command)
	if vim.v.shell_error == 0 then
		if output then
			return output
		else
			return nil
		end
	else
		return nil
	end
end

local get_bun_version = function()
	local result = run_command("bun --version")
	if result == nil then
		vim.health.error("failed to read bun version")
	else
		vim.health.ok("bun: " .. result:gsub("\n*$", ""))
	end
end

local get_current_commit_hash = function()
	local result = run_command("git -C $(dirname " .. vim.fn.shellescape(vim.fn.expand("%:p")) .. ") rev-parse HEAD")
	if result == nil then
		vim.health.error("failed to read git-commit hash")
	else
		vim.health.info("git-commit: " .. result:gsub("\n*$", ""))
	end
end

M.check = function()
	vim.health.start("github-preview.nvim")
	vim.health.info("platform: " .. get_platform())
	get_current_commit_hash()
	get_bun_version()
end

return M

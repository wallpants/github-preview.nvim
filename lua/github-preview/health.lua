local M = {}

local function check_platform()
	local function get_platform()
		local os_name = vim.loop.os_uname().sysname
		if os_name == "Windows_NT" then
			return "win"
		elseif os_name == "Darwin" then
			local arch = vim.fn.system("arch")
			if string.match(arch, "arm64") then
				return "macos-arm64"
			end
			return "macos"
		elseif os_name == "Linux" then
			-- Check for common Linux distribution files
			local distro = ""
			if vim.fn.filereadable("/etc/os-release") then
				distro = vim.fn.system("grep -E '^ID=' /etc/os-release | cut -d'=' -f2 | tr -d '\"'")
			elseif vim.fn.filereadable("/etc/lsb-release") then
				distro = vim.fn.system("grep -E '^DISTRIB_ID=' /etc/lsb-release | cut -d'=' -f2 | tr -d '\"'")
			end

			-- Trim newline characters at the end
			distro = distro:gsub("\n*$", "")

			if distro ~= nil and distro ~= "" then
				return distro
			end

			return "linux"
		end
		return "unknown"
	end

	vim.health.info("platform: " .. get_platform())
end

---@param command string
local function run_command(command)
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

local function check_bun_version()
	local result = run_command("bun --version")
	if result == nil then
		vim.health.error("failed to read bun version")
	else
		vim.health.ok("bun: " .. result:gsub("\n*$", ""))
	end
end

local function check_current_commit_hash()
	local result =
		run_command("git -C $(dirname " .. vim.fn.shellescape(vim.fn.expand("%:p")) .. ") rev-parse --short HEAD")
	if result == nil then
		vim.health.error("failed to read git-commit hash")
	else
		vim.health.info("git-commit: " .. result:gsub("\n*$", ""))
	end
end

M.check = function()
	vim.health.start("github-preview.nvim")
	check_platform()
	check_current_commit_hash()
	check_bun_version()
end

return M

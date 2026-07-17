-- Minimal init used to run lua tests headlessly:
-- nvim --headless --noplugin -u tests/minimal_init.lua \
--   -c "PlenaryBustedDirectory tests/ {minimal_init = 'tests/minimal_init.lua'}"

local plenary_dir = os.getenv("PLENARY_DIR") or "/tmp/plenary.nvim"

if vim.fn.isdirectory(plenary_dir) == 0 then
	vim.fn.system({ "git", "clone", "--depth=1", "https://github.com/nvim-lua/plenary.nvim", plenary_dir })
end

vim.opt.rtp:prepend(plenary_dir)
vim.opt.rtp:prepend(".")

vim.cmd("runtime! plugin/plenary.vim")

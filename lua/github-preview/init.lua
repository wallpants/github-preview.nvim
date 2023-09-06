-- cspell:ignore autocmd rpcnotify jobstart finddir getinfo fnamemodify winline getenv
local Types = require("github-preview.types")

local M = {}

M.log = function(_, data)
    vim.print(data)
end

---@type nvim_plugin_opts
M.default_opts = {
    port = 6049,
    scroll_debounce_ms = 250,
    disable_sync_scroll = false,
    ignore_buffer_patterns = { "NvimTree_*" },
    sync_scroll_type = Types.SYNC_SCROLL_TYPE.top,
}

---@param ignore_buffer_patterns string[]
---@param buffer_name string
---@return boolean
local function shouldIgnoreBuffer(ignore_buffer_patterns, buffer_name)
    if buffer_name == "" then
        return true
    end

    for i = #ignore_buffer_patterns, 1, -1 do
        if string.match(buffer_name, ignore_buffer_patterns[i]) then
            return true
        end
    end

    return false
end

---@param opts nvim_plugin_opts
M.setup = function(opts)
    opts = vim.tbl_deep_extend("keep", opts, M.default_opts)

    vim.validate({
        port = { opts.port, "number" },
        scroll_debounce_ms = { opts.scroll_debounce_ms, "number" },
        disable_sync_scroll = { opts.disable_sync_scroll, "boolean" },
        ignore_buffer_patterns = { opts.ignore_buffer_patterns, "table" },
        sync_scroll_type = { opts.sync_scroll_type, "string" },
    })

    local function start_server()
        -- should look like "/Users/.../github-preview"
        local root = vim.fn.finddir(".git", ";")

        if root == "" or root == "/" then
            -- TODO(gualcasas) if no root is found, launch in single file mode
            error("root dir with .git not found")
        else
            -- if found, path is made absolute & has "/.git/" popped
            root = vim.fn.fnamemodify(root, ":p:h:h") .. "/"
        end

        local buffer_name = vim.api.nvim_buf_get_name(0)
        local init_path = vim.fn.fnamemodify(buffer_name, ":p")
        local init_lines = vim.api.nvim_buf_get_lines(0, 0, -1, true)
        local init_content = table.concat(init_lines, "\n")

        ---@type plugin_init
        vim.g.github_preview_init = {
            port = opts.port,
            root = root,
            path = init_path,
            content = init_content,
            scroll_debounce_ms = opts.scroll_debounce_ms,
            disable_sync_scroll = opts.disable_sync_scroll,
            sync_scroll_type = opts.sync_scroll_type,
        }

        vim.api.nvim_create_autocmd({ "TextChangedI", "TextChanged" }, {
            ---@param arg autocmd_arg
            callback = function(arg)
                local lines = vim.api.nvim_buf_get_lines(0, 0, -1, true)
                local content = table.concat(lines, "\n")

                ---@type content_change
                local content_change = {
                    abs_path = arg.file,
                    content = content,
                }

                -- TODO(gualcasas) maybe filter with autocmd pattern instead of manually
                if not shouldIgnoreBuffer(opts.ignore_buffer_patterns, arg.file) then
                    vim.rpcnotify(0, "github-preview-content-change", content_change)
                end
            end,
        })

        vim.api.nvim_create_autocmd({ "CursorHoldI", "CursorHold" }, {
            ---@param arg autocmd_arg
            callback = function(arg)
                local cursor_line = vim.api.nvim_win_get_cursor(0)[1]

                ---@type cursor_move
                local cursor_move = {
                    abs_path = arg.file,
                    cursor_line = cursor_line,
                }

                -- TODO(gualcasas) maybe filter with autocmd pattern instead of manually
                if not shouldIgnoreBuffer(opts.ignore_buffer_patterns, arg.file) then
                    vim.rpcnotify(0, "github-preview-cursor-move", cursor_move)
                end
            end,
        })

        local __filename = debug.getinfo(1, "S").source:sub(2)
        local plugin_root = vim.fn.fnamemodify(__filename, ":p:h:h:h") .. "/"

        local is_dev = os.getenv("GP_IS_DEV")

        local dev_cmd = "pnpm tsx watch src/index.ts"
        local cmd = is_dev and dev_cmd or "node dist/index.js"

        vim.fn.jobstart(cmd, {
            cwd = plugin_root .. "js/bridge-neovim",
            stderr_buffered = false,
            stdout_buffered = false,
            stdin = "null",
            -- on_exit = M.log,
            -- on_stdout = M.log,
            -- on_stderr = M.log,
        })
    end

    vim.api.nvim_create_user_command("GithubPreview", start_server, {})
end

return M

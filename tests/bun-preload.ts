// app/env.ts validates these env vars at import time.
// They must be defined before any test imports app code.
process.env.NVIM ??= "/tmp/fake-nvim.sock";
process.env.LOG_LEVEL ??= "none";

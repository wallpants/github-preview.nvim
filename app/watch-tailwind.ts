import { watch } from "fs";

console.log("Starting watcher...");

const watcher = watch(import.meta.dir + "/src/web", { recursive: true }, () => {
    const { stdout, stderr } = Bun.spawnSync({
        cmd: ["bun", "run", "tailwind:compile"],
        cwd: import.meta.dir,
    });
    console.log(stderr.toString());
    console.log(stdout.toString());
});

process.on("SIGINT", () => {
    // close watcher when Ctrl-C is pressed
    console.log("Closing watcher...");
    watcher.close();
    process.exit(0);
});

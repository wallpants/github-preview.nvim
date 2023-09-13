// run command in workspace packages
import { globby } from "globby";

const command = process.argv[2];
if (!command) throw Error("command not specified");

const dirs = await globby("*", {
    cwd: import.meta.dir,
    gitignore: true,
    onlyDirectories: true,
});

for (const dir of dirs) {
    const abs = import.meta.dir + "/" + dir;
    console.log(dir);
    Bun.spawn(["bun", "run", command], {
        cwd: abs,
        stdout: "inherit",
    });
}

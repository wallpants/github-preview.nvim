// run command in workspace packages
import { readdirSync } from "node:fs";

const command = process.argv[2];
if (!command) throw Error("command not specified");

const dirs = readdirSync(import.meta.dir).filter((entry) => entry !== "recursive.ts");

for (const dir of dirs) {
    const abs = import.meta.dir + "/" + dir;
    console.log("abs: ", abs);
    Bun.spawn(["bun", "run", command], {
        cwd: abs,
    });
}

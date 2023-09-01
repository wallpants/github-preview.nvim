import { logger } from "./logger";

const sleep = (ms: number) =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, ms);
    });

async function loopPrint() {
    // eslint-disable-next-line
    while (true) {
        logger.error({
            name: "Gualberto",
            nvim: process.env["NVIM"],
        });
        await sleep(3000);
    }
}

void loopPrint();

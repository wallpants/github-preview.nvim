import ipc from "node-ipc";
import { EVENT_NAME } from "./consts";

ipc.config.id = "hello";
ipc.config.retry = 1000;

ipc.connectTo("world", function () {
    ipc.of["world"]?.on("connect", function () {
        ipc.of["world"]?.emit(EVENT_NAME, {
            id: ipc.config.id,
            message: "hello",
        });
    });
    ipc.of["world"]?.on("disconnect", function () {
        ipc.log("disconnected from world");
    });
    ipc.of["world"]?.on(EVENT_NAME, function (data) {
        ipc.log("got a message from world : ", data);
    });

    ipc.of["world"]?.on("destroy", (...args) => {
        console.log("GUALBERTO");
        // eslint-disable-next-line
        console.log(...args);
    });
});

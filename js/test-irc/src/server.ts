import { type Socket } from "net";
import ipc from "node-ipc";
import { EVENT_NAME } from "./consts";
import { type Data } from "./types";

ipc.config.id = "world";
ipc.config.retry = 1500;
ipc.config.maxConnections = 1;

ipc.serve(function () {
    ipc.server.on(EVENT_NAME, function (data: Data, socket: Socket) {
        ipc.server.emit(socket, EVENT_NAME, {
            id: ipc.config.id,
            message: data.message + " world!",
        });
    });
});

ipc.server.start();

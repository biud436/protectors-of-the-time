import * as http from 'http';

import type { Express } from 'express';
import { Server } from 'socket.io';

export function createIO(app: Express) {
    const server = http.createServer(app);
    const io = new Server(server);

    io.on('connection', (socket) => {
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });

        io.on('log', (data) => {
            console.log(data);
        });

        socket.on('log', (data) => {
            io.emit('log', data);
        });
    });

    return server;
}

import type { Server } from 'yues-client';
import type { MinimalEventEmitterConstructor } from '@/@types';
import { initEnv } from '@/lua-functions';

export let platform: Promise<{
    server: Server;
    EventEmitter: MinimalEventEmitterConstructor;
}> = Promise.reject(
    new EvalError("Server wasn't initialized properly. Make sure to call `init()` before creating any components"),
);

let initialized = false;

export async function init(server: Server, EventEmitter: MinimalEventEmitterConstructor) {
    if (initialized) return platform.then(() => {});
    initialized = true;
    platform = Promise.resolve().then(async () => {
        await server.initialized;
        await server.exec(...initEnv());
        return {
            server,
            EventEmitter,
        };
    });
}

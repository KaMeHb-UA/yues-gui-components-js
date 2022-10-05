import type { Server } from 'yues-client';
import type { MinimalEventEmitterConstructor } from '@/@types';
import { initEnv } from '@/lua-functions';

let platform: Promise<{
    server: Server;
    EventEmitter: MinimalEventEmitterConstructor;
}> = Promise.resolve(
    null,
);

export async function getPlatformTools() {
    const res = await platform;
    if (!res) throw new Error("Server wasn't initialized properly. Make sure to call `init()` before creating any components");
    return res;
}

let initialized = false;

export async function init(server: Server, EventEmitter: MinimalEventEmitterConstructor) {
    if (initialized) return platform.then(() => {});
    initialized = true;
    async function getPlatform() {
        await server.initialized;
        await server.exec(...initEnv());
        return {
            server,
            EventEmitter,
        };
    }
    platform = getPlatform();
}

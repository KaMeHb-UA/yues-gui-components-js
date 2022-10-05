import type { Server } from 'yues-client';
import type { MinimalEventEmitterConstructor } from '@/@types';
import { initEnv } from '@/lua-functions';

let platform: Promise<{
    server: Server;
    EventEmitter: MinimalEventEmitterConstructor;
}>;

export async function getPlatformTools() {
    if (!platform) throw new Error("Server wasn't initialized properly. Make sure to call `init()` before creating any components");
    return platform;
}

let initialized = false;

export async function init(server: Server, EventEmitter: MinimalEventEmitterConstructor) {
    if (initialized) return;
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

export async function destroy(childProcessTimeout?: number) {
    if (!initialized) return;
    const { server } = await platform;
    await server.destroy(childProcessTimeout);
}

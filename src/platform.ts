import type { Server } from 'yues-client';
import type { MinimalEventEmitterConstructor } from '@/@types';
import { App } from '@/components/app';
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
let app: App;

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
    app = new App();
    await app.initialized;
    return app;
}

export async function destroy(childProcessTimeout?: number) {
    if (!initialized) return;
    initialized = false;
    const platformPromise = platform;
    platform = undefined;
    const { server } = await platformPromise;
    if (app) {
        await app.initialized;
        await app.destroy();
    }
    await server.destroy(childProcessTimeout);
}

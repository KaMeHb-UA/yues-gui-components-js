import type { Server } from 'yues-client';
import { initEnv } from '@/lua-functions';

let initialized: Promise<void>;

export const init = (server: Server) => {
    if (!initialized) initialized = Promise.resolve().then(async () => {
        await server.initialized;
        await server.exec(...initEnv());
    });
    return initialized;
};

export * from '@/components';

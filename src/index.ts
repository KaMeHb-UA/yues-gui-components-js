import type { Server } from 'yues-client';
import { initEnv } from '@/lua-functions';

let initialized = false;

export const init = async (server: Server) => {
    if (initialized) return;
    initialized = true;
    await server.exec(initEnv);
};

export * from '@/components';

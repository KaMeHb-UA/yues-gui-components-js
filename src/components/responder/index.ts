import type { ServerLuaFunction } from 'yues-client';
import { RemoteElement } from '@/components/@element';
import { serverPropName, luaVarRef, eventListPropName, initMethodName } from '@/components/@symbols';
import { destroyedMethod, tuple } from '@/utils';

const proxiedMethods = tuple(
    'setcapture',
    'releasecapture',
    'hascapture',
);

const events = tuple(
    'mousedown',
    'mouseup',
    'mousemove',
    'mouseenter',
    'mouseleave',
    'keydown',
    'keyup',
    'capturelost',
);

export class Responder<
    Events extends string = never
> extends RemoteElement<
    Events | typeof events[number]
> {
    protected readonly [eventListPropName] = (events as string[]).concat(super[eventListPropName]);

    protected async [initMethodName]() {
        const server = this[serverPropName];
        const luavar = this[luaVarRef];
        const proxied = await Promise.all([
            server.createFunction(`${luavar}:setcapture()`, []),
            server.createFunction(`${luavar}:releasecapture()`, []),
            server.createFunction(`return ${luavar}:hascapture()`, []),
        ]);
        proxiedMethods.forEach((name, i) => this[name] = proxied[i]);
    }

    /**
     * Set mouse capture to the responder
     */
    setcapture: ServerLuaFunction<[], void>;

    /**
     * Release mouse capture if the responder has mouse capture
     */
    releasecapture: ServerLuaFunction<[], void>;

    /**
     * Return whether the responder has mouse capture
     */
    hascapture: ServerLuaFunction<[], boolean>;

    async destroy() {
        if (!await this.initialized) return;
        await Promise.all(proxiedMethods.map((name) => {
            const r = this[name].destroy();
            this[name] = destroyedMethod;
            return r;
        }));
        await super.destroy();
    }
}

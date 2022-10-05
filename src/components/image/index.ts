import type { ServerLuaFunction } from 'yues-client';
import type { SizeF } from '@/@types';
import { RemoteElement } from '@/components/@element';
import { initMethodName, luaVarRef, serverPropName } from '@/components/@symbols';
import { tuple } from '@/utils';

const internalCall = Symbol();

type CreationArgs = {
    empty?: boolean;
    path?: string;
    buffer?: Buffer;
    scalefactor?: number;
};

const proxiedMethods = tuple(
    'getsize',
    'getscalefactor',
);

export class Image extends RemoteElement {
    constructor(_internalCall: never, creationArgs: never) {
        if (_internalCall !== internalCall) throw new TypeError("Can't construct Color instance directly. Use static methods instead");
        const { empty, path, buffer, scalefactor } = creationArgs as CreationArgs;
        if (empty) {
            super('return gui.Image.createempty()', [], []);
        } else if (path) {
            super('return gui.Image.createfrompath(path)', ['path'], [path]);
        } else if (buffer && scalefactor) {
            super('return gui.Image.createfrombuffer(buffer.data, scalefactor)', ['buffer', 'scalefactor'], [buffer, scalefactor]);
        } else {
            throw new Error("CreationArgs aren't specified properly");
        }
    }

    protected async [initMethodName]() {
        const server = this[serverPropName];
        const luavar = this[luaVarRef];
        const proxied = await Promise.all([
            server.createFunction(`return ${luavar}:getsize()`, []),
            server.createFunction(`return ${luavar}:getscalefactor()`, []),
        ]);
        proxiedMethods.forEach((name, i) => this[name] = proxied[i]);
    }

    /**
     * Create an empty image
     */
    static async createempty() {
        const image = new Image(internalCall as never, { empty: true } as never);
        await image.initialized;
        return image;
    }

    /**
     * Create an image by reading from `path`
     */
    static async createfrompath(path: string) {
        const image = new Image(internalCall as never, { path } as never);
        await image.initialized;
        return image;
    }

    /**
     * Create an image from `buffer` in memory, with `scalefactor`
     */
    static async createfrombuffer(buffer: Buffer, scalefactor: number) {
        const image = new Image(internalCall as never, { buffer, scalefactor } as never);
        await image.initialized;
        return image;
    }

    /**
     * Return image's size in DIP
     */
    getsize: ServerLuaFunction<[], SizeF>;

    /**
     * Return image's scale factor
     */
    getscalefactor: ServerLuaFunction<[], number>;

    async destroy() {
        if (!await this.initialized) return;
        await super.destroy();
    }
}

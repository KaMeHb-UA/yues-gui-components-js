import type { ServerLuaFunction } from 'yues-client';
import { RemoteElement } from '@/components/@element';
import { idPropName, initMethodName, luaVarRef, serverPropName } from '@/components/@symbols';
import { tuple } from '@/utils';

const internalCall = Symbol();

type FontWeight = 
    | 'thin'
    | 'extra-light'
    | 'light'
    | 'normal'
    | 'medium'
    | 'semi-bold'
    | 'bold'
    | 'extra-bold'
    | 'black'
    ;

type FontStyle = 'normal' | 'italic';

type CreationArgs = {
    def?: boolean;
    byName?: {
        name: string;
        size: number;
        weight: string;
        style: string;
    };
    byPath?: {
        path: string;
        size: number;
    };
    derived?: {
        parent: string;
        sizedelta: number;
        weight: FontWeight;
        style: FontStyle;
    };
};

const proxiedMethods = tuple(
    'getname',
    'getsize',
    'getweight',
    'getstyle',
);

export class Font extends RemoteElement {
    constructor(_internalCall: never, creationArgs: never) {
        if (_internalCall !== internalCall) throw new TypeError("Can't construct Font instance directly. Use static methods instead");
        const { def, byName, byPath, derived } = creationArgs as CreationArgs;
        if (def) {
            super('return gui.Font.default()', [], []);
        } else if (byName) {
            const { name, size, weight, style } = byName;
            super('return gui.Font.create(name, size, weight, style)', ['name', 'size', 'weight', 'style'], [name, size, weight, style]);
        } else if (byPath) {
            const { path, size } = byPath;
            super('return gui.Font.createfrompath(path, size)', ['path', 'size'], [path, size]);
        } else if (derived) {
            const { sizedelta, weight, style, parent } = derived;
            super(`return ${parent}:derive(sizedelta, weight, style)`, ['sizedelta', 'weight', 'style'], [sizedelta, weight, style]);
        } else {
            throw new Error("CreationArgs aren't specified properly");
        }
    }

    protected async [initMethodName]() {
        const server = this[serverPropName];
        const luavar = this[luaVarRef];
        const proxied = await Promise.all([
            server.createFunction(`return ${luavar}:getname()`, []),
            server.createFunction(`return ${luavar}:getsize()`, []),
            server.createFunction(`return ${luavar}:getweight()`, []),
            server.createFunction(`return ${luavar}:getstyle()`, []),
        ]);
        proxiedMethods.forEach((name, i) => this[name] = proxied[i]);
    }

    /**
     * Return the default font used for displaying text
     */
    static async default() {
        const font = new Font(internalCall as never, { empty: true } as never);
        await font.initialized;
        return font;
    }

    /**
     * Create a Font implementation with the specified `name`, DIP `size`, `weight` and `style`
     */
    static async create(name: string, size: number, weight: FontWeight, style: FontStyle) {
        const font = new Font(internalCall as never, { byName: { name, size, weight, style } } as never);
        await font.initialized;
        return font;
    }

    /**
     * Create a Font implementation with the specified `name`, DIP `size`, `weight` and `style`
     */
    static async createfrompath(path: string, size: number) {
        const font = new Font(internalCall as never, { byPath: { path, size } } as never);
        await font.initialized;
        return font;
    }

    /**
     * Returns a new Font derived from the existing font.
     * 
     * The `sizedelta` is the size in DIP to add to the current font
     */
    async derive(sizedelta: number, weight: FontWeight, style: FontStyle) {
        const derived = new Font(internalCall as never, {
            derived: {
                parent: this[luaVarRef],
                sizedelta,
                weight,
                style,
            },
        } as never);
        await derived.initialized;
        return derived;
    }

    /**
     * Return font's family name
     */
    getname: ServerLuaFunction<[], string>;

    /**
     * Return font's DIP size
     */
    getsize: ServerLuaFunction<[], number>;

    /**
     * Return the font weight
     */
    getweight: ServerLuaFunction<[], FontWeight>;

    /**
     * Return the font style
     */
    getstyle: ServerLuaFunction<[], FontStyle>;

    async destroy() {
        if (!await this.initialized) return;
        await super.destroy();
    }
}

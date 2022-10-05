import { RemoteElement } from '@/components/@element';
import { initMethodName } from '@/components/@symbols';

type ColorName = 'text' | 'disabled-text' | 'control' | 'window-background';

const internalCall = Symbol();

type CreationArgs = {
    name?: string;
    rgb?: {
        r: number;
        g: number;
        b: number;
    };
    argb?: {
        a: number;
        r: number;
        g: number;
        b: number;
    };
};

export class Color extends RemoteElement {
    constructor(_internalCall: never, creationArgs: never) {
        if (_internalCall !== internalCall) throw new TypeError("Can't construct Color instance directly. Use static methods instead");
        const { name, rgb, argb } = creationArgs as CreationArgs;
        if (name) {
            super('return gui.Color.get(name)', ['name'], [name]);
        } else if (rgb) {
            const { r, g, b } = rgb;
            super('return gui.Color.rgb(r, g, b)', ['r', 'g', 'b'], [r, g, b]);
        } else if (argb) {
            const { a, r, g, b } = argb;
            super('return gui.Color.argb(a, r, g, b)', ['a', 'r', 'g', 'b'], [a, r, g, b]);
        } else {
            throw new Error("CreationArgs aren't specified properly");
        }
    }

    protected async [initMethodName]() {}

    /**
     * Return the color with theme `name`
     */
    static async get(name: ColorName) {
        const color = new Color(internalCall as never, { name } as never);
        await color.initialized;
        return color;
    }

    /**
     * Create an opaque RGB color
     */
    static async rgb(r: number, g: number, b: number) {
        const color = new Color(internalCall as never, { rgb: { r, g, b } } as never);
        await color.initialized;
        return color;
    }

    /**
     * Create an ARGB color
     */
    static async argb(a: number, r: number, g: number, b: number) {
        const color = new Color(internalCall as never, { argb: { a, r, g, b } } as never);
        await color.initialized;
        return color;
    }

    async destroy() {
        if (!await this.initialized) return;
        await super.destroy();
    }
}

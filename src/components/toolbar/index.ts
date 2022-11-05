import type { ServerLuaFunction } from 'yues-client';
import { serverPropName, luaVarRef, eventListPropName, initMethodName } from '@/components/@symbols';
import { RemoteElement } from '@/components/@element';
import { tuple } from '@/utils';

type ToolbarDisplayMode = 'default' | 'icon-and-label' | 'icon' | 'label';

const proxiedMethods = tuple(
    'setdefaultitemidentifiers',
    'setalloweditemidentifiers',
    'setallowcustomization',
    'setdisplaymode',
    'setvisible',
    'isvisible',
    'getidentifier',
);

const events = tuple();

/**
 * **NOT YET SUPPORTED DUE TO DELEGATE FUNCTION**
 * 
 * This view is only implemented for macOS by wrapping `NSToolbar`.
 * The API is still experimental and will be changed in future.
 * Currently certain items are not aligned correctly in toolbar.
 * 
 * The toolbar items are not added manually like the normal views,
 * instead you have to implement the get_item delegate which creates
 * items on request, and then call SetDefaultItemIdentifiers to
 * specify the default items to show
 */
export class Toolbar<
    Events extends string = never
> extends RemoteElement<
    Events | typeof events[number]
> {
    protected get [eventListPropName](): string[] { return (events as string[]).concat(super[eventListPropName]) };

    constructor(identifier: string) {
        super('return gui.Toolbar.create(identifier)', ['identifier'], [identifier]);
    }

    protected async [initMethodName]() {
        await super[initMethodName]();
        const server = this[serverPropName];
        const luavar = this[luaVarRef];
        const proxied = await Promise.all([
            server.createFunction(`${luavar}:setdefaultitemidentifiers(identifiers)`, ['identifiers']),
            server.createFunction(`${luavar}:setalloweditemidentifiers(identifiers)`, ['identifiers']),
            server.createFunction(`${luavar}:setallowcustomization(allow)`, ['allow']),
            server.createFunction(`${luavar}:setdisplaymode(mode)`, ['mode']),
            server.createFunction(`${luavar}:setvisible(visible)`, ['visible']),
            server.createFunction(`return ${luavar}:isvisible()`, []),
            server.createFunction(`return ${luavar}:getidentifier()`, []),
        ]);
        proxiedMethods.forEach((name, i) => this[name] = proxied[i]);
    }

    /**
     * Set the identifiers of default items that would show in toolbar
     */
    setdefaultitemidentifiers: ServerLuaFunction<[identifiers: string[]], void>;

    /**
     * Set the identifiers of the items that are allowed to show in toolbar
     */
    setalloweditemidentifiers: ServerLuaFunction<[identifiers: string[]], void>;

    /**
     * Set whether users are allowed to customize the toolbar
     */
    setallowcustomization: ServerLuaFunction<[allow: boolean], void>;

    /**
     * Set the display mode of the toolbar items
     */
    setdisplaymode: ServerLuaFunction<[mode: ToolbarDisplayMode], void>;

    /**
     * Set whether toolbar is visible
     */
    setvisible: ServerLuaFunction<[visible: boolean], void>;

    /**
     * Return whether toolbar is visible
     */
    isvisible: ServerLuaFunction<[], boolean>;

    /**
     * Return whether toolbar is visible
     */
    getidentifier: ServerLuaFunction<[], string>;

    async destroy() {
        if (!await this.initialized) return;
        await Promise.all(proxiedMethods.map((name) => this[name].destroy()));
        await super.destroy();
    }
}

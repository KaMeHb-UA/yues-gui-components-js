import type { ServerLuaFunction } from 'yues-client';
import type { MenuItem } from '@/components/menuitem';
import { serverPropName, luaVarRef, eventListPropName, initMethodName, idPropName } from '@/components/@symbols';
import { MenuBase } from '@/components/menubase';
import { tuple } from '@/utils';
import { LUA_GET_FROM_GLOBAL_STORAGE_FUNC_NAME } from '@/constants';

const proxiedMethods = tuple(
    'popup',
);

const events = tuple();

const luaConstructor = `
local items = {}
for k, v in pairs(ids) do
    items[k] = ${LUA_GET_FROM_GLOBAL_STORAGE_FUNC_NAME}(v)
end
return gui.Menu.create(items)
`;

export class Menu<Events extends string = never> extends MenuBase<Events> {
    protected get [eventListPropName](): string[] { return (events as string[]).concat(super[eventListPropName]) };

    constructor (items: MenuItem[]) {
        super(luaConstructor.trim(), ['ids'], [items.map(item => item[idPropName])]);
    }

    protected async [initMethodName]() {
        await super[initMethodName]();
        const server = this[serverPropName];
        const luavar = this[luaVarRef];
        const proxied = await Promise.all([
            server.createFunction(`${luavar}:popup()`, []),
        ]);
        proxiedMethods.forEach((name, i) => this[name] = proxied[i]);
    }

    /**
     * Show the popup menu at current mouse position,
     * this method will block until the menu is dismissed
     */
    popup: ServerLuaFunction<[], void>;

    async destroy() {
        if (!await this.initialized) return;
        await Promise.all(proxiedMethods.map((name) => this[name].destroy()));
        await super.destroy();
    }
}

import type { ServerLuaFunction } from 'yues-client';
import type { MenuItem } from '@/components/menuitem';
import { serverPropName, luaVarRef, eventListPropName, initMethodName } from '@/components/@symbols';
import { RemoteElement } from '@/components/@element';
import { tuple } from '@/utils';
import { refSetterOnRef, refInsertOnRefByIdx, refGetterOnRefByIdx } from '@/lua-functions';

const proxiedMethods = tuple(
    'append',
    'insert',
    'remove',
    'itemcount',
    'itemat',
);

const events = tuple();

export abstract class MenuBase<Events extends string = never> extends RemoteElement<Events> {
    protected get [eventListPropName](): string[] { return (events as string[]).concat(super[eventListPropName]) };

    protected async [initMethodName]() {
        const server = this[serverPropName];
        const luavar = this[luaVarRef];
        const proxied = await Promise.all([
            server.createFunction(...refSetterOnRef(luavar, 'append')),
            server.createFunction(...refInsertOnRefByIdx(luavar, 'insert')),
            server.createFunction(...refSetterOnRef(luavar, 'remove')),
            server.createFunction(`return ${luavar}:itemcount()`, []),
            server.createFunction(...refGetterOnRefByIdx(luavar, 'itemat')),
        ]);
        proxiedMethods.forEach((name, i) => this[name] = proxied[i]);
    }

    /**
     * Append the `item` to the menu
     */
    append: ServerLuaFunction<[item: MenuItem], void>;

    /**
     * Insert the `item` at `index` to the menu
     * 
     * _Note that the index counts from 1, following lua's convention_
     */
    insert: ServerLuaFunction<[item: MenuItem, index: number], void>;

    /**
     * Remove the `item` from the menu
     */
    remove: ServerLuaFunction<[item: MenuItem], void>;

    /**
     * Return the count of items in the menu
     */
    itemcount: ServerLuaFunction<[], number>;

    /**
     * Return the `item` at index
     * 
     * _Note that the index counts from 1, following lua's convention_
     */
    itemat: ServerLuaFunction<[index: number], MenuItem>;

    async destroy() {
        if (!await this.initialized) return;
        await Promise.all(proxiedMethods.map((name) => this[name].destroy()));
        await super.destroy();
    }
}

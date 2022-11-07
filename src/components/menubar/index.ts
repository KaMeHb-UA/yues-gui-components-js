import type { MenuItem } from '@/components/menuitem';
import { idPropName } from '@/components/@symbols';
import { MenuBase } from '@/components/menubase';
import { LUA_GET_FROM_GLOBAL_STORAGE_FUNC_NAME } from '@/constants';

const luaConstructor = `
local items = {}
for k, v in pairs(ids) do
    items[k] = ${LUA_GET_FROM_GLOBAL_STORAGE_FUNC_NAME}(v)
end
return gui.MenuBar.create(items)
`;

export abstract class MenuBar<Events extends string = never> extends MenuBase<Events> {
    constructor (items: MenuItem[]) {
        super(luaConstructor.trim(), ['ids'], [items.map(item => item[idPropName])]);
    }
}

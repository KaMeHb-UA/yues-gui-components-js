import type { ServerLuaFunction } from 'yues-client';
import type { Menu } from '@/components/menu';
import type { Image } from '@/components/image';
import { RemoteElement } from '@/components/@element';
import { eventListPropName, initMethodName, luaVarRef, serverPropName } from '@/components/@symbols';
import { tuple } from '@/utils';
import { refGetterOnRef, refSetterOnRef } from '@/lua-functions';

type MenuItemType = 'label' | 'checkbox' | 'radio' | 'separator' | 'submenu';

/**
 * Available only on macOS
 */
type MenuItemRoleMac = 'about' | 'hide' | 'hide-others' | 'unhide' | 'help' | 'window' | 'services';

/**
 * For common menu items like `Copy` and `Paste`, manually implementing them for all platforms
 * is very boring work. You can instead specify a `role` for a menu item, and Yue will
 * automatically set labels, accelerators and actions for the menu item
 */
type MenuItemRole = MenuItemRoleMac | 'copy' | 'cut' | 'paste' | 'select-all' | 'undo' | 'redo' | 'minimize' | 'maximize' | 'close-window';

type MenuItemOptionsWithType = {
    type: MenuItemType;
    checked?: boolean;
    submenu?: Menu;
    visible?: boolean;
    enabled?: boolean;
    label: string;
    accelerator?: string;
    image?: Image;
    onclick?: () => void;
};

type MenuItemOptionsWithRole = {
    role: MenuItemRole;
};

type MenuItemOptions = MenuItemOptionsWithType | MenuItemOptionsWithRole;

const proxiedMethods = tuple(
    'click',
    'setlabel',
    'getlabel',
    'setsubmenu',
    'getsubmenu',
    'setchecked',
    'ischecked',
    'setenabled',
    'isenabled',
    'setvisible',
    'isvisible',
    'setaccelerator',
    'setimage',
    'getimage',
);

const events = tuple(
    'click',
);

export abstract class MenuItem<
    Events extends string = never
> extends RemoteElement<
    Events | typeof events[number]
> {
    constructor(options: MenuItemType | MenuItemOptions) {
        if (typeof options === 'string') {
            super('return gui.MenuItem.create(type)', ['type'], [options]);
        } else {
            const optionsCopy = Object.assign({}, options) as MenuItemOptionsWithType;
            const { submenu, image, onclick } = optionsCopy;
            delete optionsCopy.submenu;
            delete optionsCopy.image;
            delete optionsCopy.onclick;
            super('return gui.MenuItem.create(options)', ['options'], [optionsCopy]);
            this.initialized = (this.initialized as Promise<boolean>).then(async (init) => {
                if (!init) return false;
                const additionalOps: Promise<void>[] = [];
                if (submenu) additionalOps.push(this.setsubmenu(submenu));
                if (image) additionalOps.push(this.setimage(image));
                if (onclick) this.on('click', onclick);
                await Promise.all(additionalOps);
                this.initialized = true;
                return true;
            });
        }
    }

    protected get [eventListPropName](): string[] { return (events as string[]).concat(super[eventListPropName]) };

    protected async [initMethodName]() {
        const server = this[serverPropName];
        const luavar = this[luaVarRef];
        const proxied = await Promise.all([
            server.createFunction(`${luavar}:click()`, []),
            server.createFunction(`${luavar}:setlabel(label)`, ['label']),
            server.createFunction(`return ${luavar}:getlabel()`, []),
            server.createFunction(...refSetterOnRef(luavar, 'setsubmenu')),
            server.createFunction(...refGetterOnRef(luavar, 'getsubmenu')),
            server.createFunction(`${luavar}:setchecked(checked)`, ['checked']),
            server.createFunction(`return ${luavar}:ischecked()`, []),
            server.createFunction(`${luavar}:setenabled(enabled)`, ['enabled']),
            server.createFunction(`return ${luavar}:isenabled()`, []),
            server.createFunction(`${luavar}:setvisible(visible)`, ['visible']),
            server.createFunction(`return ${luavar}:isvisible()`, []),
            server.createFunction(`${luavar}:setaccelerator(accelerator)`, ['accelerator']),
            server.createFunction(...refSetterOnRef(luavar, 'setimage')),
            server.createFunction(...refGetterOnRef(luavar, 'getimage')),
        ]);
        proxiedMethods.forEach((name, i) => this[name] = proxied[i]);
    }

    /**
     * Emulate user clicking the menu item
     */
    click: ServerLuaFunction<[], void>;

    /**
     * Change the item's label
     */
    setlabel: ServerLuaFunction<[label: string], void>;

    /**
     * Return the item's label
     */
    getlabel: ServerLuaFunction<[], string>;

    /**
     * Set the submenu attached to the item.
     * 
     * This method only works for `submenu` type menu items
     */
    setsubmenu: ServerLuaFunction<[submenu: Menu], void>;

    /**
     * Return the submenu attached to the item
     */
    getsubmenu: ServerLuaFunction<[], Menu>;

    /**
     * Set the `checked` state of the item.
     * 
     * This method only works for `radio` and `checkbox` type menu items
     */
    setchecked: ServerLuaFunction<[checked: boolean], void>;

    /**
     * Return the `checked` state of the item
     */
    ischecked: ServerLuaFunction<[], boolean>;

    /**
     * Enable/disable the item
     */
    setenabled: ServerLuaFunction<[enabled: boolean], void>;

    /**
     * Return whether the item is enabled
     */
    isenabled: ServerLuaFunction<[], boolean>;

    /**
     * Show/hide the item
     */
    setvisible: ServerLuaFunction<[visible: boolean], void>;

    /**
     * Return whether the item is visible to users
     */
    isvisible: ServerLuaFunction<[], boolean>;

    /**
     * Set the `accelerator` used to activate the item
     */
    setaccelerator: ServerLuaFunction<[accelerator: string], void>;

    /**
     * **`macOS`** **`Windows`**
     * 
     * Set the item's image
     */
    setimage: ServerLuaFunction<[image: Image], void>;

    /**
     * **`macOS`** **`Windows`**
     * 
     * Return the item's image
     */
    getimage: ServerLuaFunction<[], Image>;

    async destroy() {
        if (!await this.initialized) return;
        await Promise.all(proxiedMethods.map((name) => this[name].destroy()));
        await super.destroy();
    }
}

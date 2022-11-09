import type { Server, ServerLuaFunction } from 'yues-client';
import type { MenuBar } from '@/components/menubar';
import { tuple } from '@/utils';
import { getPlatformTools } from '@/platform';
import { refGetterOnRef, refSetterOnRef } from '@/lua-functions';
import { initMethodName, luaVarRef, serverPropName } from '@/components/@symbols';

type AppShortcutOptions = {
    arguments?: string,
    description?: string,
    workingdir?: string,
};

type AppActivationPolicy = 'regular' | 'accessory' | 'prohibited';

const proxiedMethods = tuple(
    'setname',
    'getname',
    'setid',
    'getid',
    'setapplicationmenu',
    'getapplicationmenu',
    'setdockbadgelabel',
    'getdockbadgelabel',
    'isrunningasuwp',
    'createstartmenushortcut',
    'getstartmenushortcutpath',
    'activate',
    'deactivate',
    'isactive',
    'setactivationpolicy',
    'getactivationpolicy',
);

async function basicInit(this: App) {
    const { server } = await getPlatformTools();
    this[serverPropName] = server;
    // call external init
    await this[initMethodName]();
    return true;
}

export class App {
    protected [serverPropName]: Server;

    [luaVarRef] = 'gui.app';

    initialized: boolean | Promise<boolean>;

    constructor() {
        this.initialized = basicInit.call(this);
    }

    protected async [initMethodName]() {
        const server = this[serverPropName];
        const luavar = this[luaVarRef];
        const proxied = await Promise.all([
            server.createFunction(`print(name)\n${luavar}:setname(name)`, ['name']),
            server.createFunction(`return ${luavar}:getname()`, []),
            server.createFunction(`${luavar}:setid(id)`, ['id']),
            server.createFunction(`return ${luavar}:getid()`, []),
            server.createFunction(...refSetterOnRef(luavar, 'setapplicationmenu')),
            server.createFunction(...refGetterOnRef(luavar, 'getapplicationmenu')),
            server.createFunction(`${luavar}:setdockbadgelabel(label)`, ['label']),
            server.createFunction(`return ${luavar}:getdockbadgelabel()`, []),
            server.createFunction(`return ${luavar}:isrunningasuwp()`, []),
            server.createFunction(`${luavar}:createstartmenushortcut(options)`, ['options']),
            server.createFunction(`return ${luavar}:getstartmenushortcutpath()`, []),
            server.createFunction(`${luavar}:activate(force)`, ['force']),
            server.createFunction(`${luavar}:deactivate()`, []),
            server.createFunction(`return ${luavar}:isactive()`, []),
            server.createFunction(`${luavar}:setactivationpolicy(policy)`, ['policy']),
            server.createFunction(`return ${luavar}:getactivationpolicy()`, []),
        ]);
        proxiedMethods.forEach((name, i) => this[name] = proxied[i]);
    }

    /**
     * Set the name of current app.
     * 
     * The app name should be something like "My App", it will be used in vairous places,
     * such as folder name when storing user data, or key name when writing registry.
     * 
     * You should always call this API at the beginning of your app.
     * 
     * On macOS it is strong recommended to use the same name with the `CFBundleName` field of app bundle's `Info.plist` file
     */
    setname: ServerLuaFunction<[name: string], void>;

    /**
     * Return current app's name.
     * 
     * If app.setname(name) has never been called, this API will try to guess a name from existing information,
     * for example the executable's version info, or the app bundle information, or the executable file's base name
     */
    getname: ServerLuaFunction<[], string>;

    /**
     * **`Windows`** **`Linux`**
     * 
     * Set the application ID.
     * 
     * The application ID must be globally unique, and it is recommended to use something like "org.myself.myapp".
     * 
     * On macOS the application ID is the app bundle ID, and there is no way to change it at runtime.
     * 
     * On Linux the application ID will be used in various places, such as the name of the
     * [`.desktop` file](https://developer.gnome.org/integration-guide/stable/desktop-files.html),
     * or the base name of GSettings schemas.
     * 
     * On Windows the application ID is [`AppUserModelID`](https://docs.microsoft.com/en-us/windows/win32/shell/appids),
     * it is mainly used to recognize which app a process belongs to. For UWP/Desktop Bridge apps, Windows will assign
     * an AppUserModelID to the app and this API should not be used
     */
    setid: ServerLuaFunction<[name: string], void>;

    /**
     * Return the application ID.
     * 
     * On macOS if the app is bundled, the app bundle ID will be returned, otherwise empty string will be returned.
     * 
     * On Linux the ID set by `setid` will be returned.
     * 
     * On Windows the [`AppUserModelID`](https://docs.microsoft.com/en-us/windows/win32/shell/appids) will be returned.
     * If neither you or Windows ever assigned an ID to the app, empty string will be returned
     */
    getid: ServerLuaFunction<[], string>;

    /**
     * **`macOS`**
     * 
     * Set the application menu bar
     */
    setapplicationmenu: ServerLuaFunction<[menu: MenuBar], void>;

    /**
     * **`macOS`**
     * 
     * Return the application menu bar
     */
    getapplicationmenu: ServerLuaFunction<[], MenuBar>;

    /**
     * **`macOS`**
     * 
     * Set the `label` to be displayed in dock’s badging area
     */
    setdockbadgelabel: ServerLuaFunction<[label: string], void>;

    /**
     * **`macOS`**
     * 
     * Get the label displayed in dock’s badging area
     */
    getdockbadgelabel: ServerLuaFunction<[], string>;

    /**
     * **`Windows`**
     * 
     * Return whether app is running as UWP/Desktop Bridge.
     * 
     * On Windows the Win32 apps can run as UWP apps by using
     * [Desktop Bridge](https://techcommunity.microsoft.com/t5/windows-dev-appconsult/desktop-bridge-8211-the-bridge-between-desktop-apps-and-the/ba-p/316488),
     * which is required for submitting Win32 apps to Microsoft Store.
     * 
     * There are a few runtime differences when running apps as UWP, and this API can be used to detect the environment
     */
    isrunningasuwp: ServerLuaFunction<[], boolean>;

    /**
     * **`Windows`**
     * 
     * Create a start menu shortcut for current user linking to current process.
     * 
     * This API will write the `AppUserModelID` and `ToastActivatorCLSID` to the shortcut file,
     * and the shortcut file's name will be the app's name, so it is recommended to call app.setid(id) and app.setname(name) before using this API.
     * 
     * Note that on Windows you should generally not write start menu shortcut automatically, by convention the file is commonly created by installers
     * or users themselves. This API is usually used for testing purpose
     */
    createstartmenushortcut: ServerLuaFunction<[options: AppShortcutOptions], void>;

    /**
     * **`Windows`**
     * 
     * Return file path to the shortcut created by the `app.createstartmenushortcut(options)` API
     */
    getstartmenushortcutpath: ServerLuaFunction<[], string>;

    /**
     * **`macOS`**
     * 
     * Make current app the active app.
     * 
     * The `force` parameter is normally set to false. When the Finder launches an app, using a value of false for `force` allows the app
     * to become active if the user waits for it to launch, but the app remains unobtrusive if the user activates another app.
     * Regardless of the setting of flag, there may be a time lag before the app activates — you should not assume the app will be active
     * immediately after sending this message
     */
    activate: ServerLuaFunction<[force: boolean], void>;

    /**
     * **`macOS`**
     * 
     * Deactivate current app
     */
    deactivate: ServerLuaFunction<[], void>;

    /**
     * **`macOS`**
     * 
     * Return whether current app is the active app
     */
    isactive: ServerLuaFunction<[], boolean>;

    /**
     * **`macOS`**
     * 
     * Modify the app's activation policy
     */
    setactivationpolicy: ServerLuaFunction<[policy: AppActivationPolicy], void>;

    /**
     * **`macOS`**
     * 
     * Return app's activation policy
     */
    getactivationpolicy: ServerLuaFunction<[], AppActivationPolicy>;

    /**
     * Destroy instance of component
     */
    async destroy() {
        if(!await this.initialized) return;
        this.initialized = false;
        await Promise.all(proxiedMethods.map((name) => this[name].destroy()));
        delete this[serverPropName];
    }
}

import type { Server, ServerLuaFunction } from 'yues-client';
import type { RectF, Color, SizeF, MinimalEventEmitterConstructor, Optional } from '@/@types';
import type { View } from '@/components/view';
import type { Toolbar } from '@/components/toolbar';
import type { Image } from '@/components/image';
import type { MenuBar } from '@/components/menubar';
import { serverPropName, luaVarRef, eventListPropName, initMethodName } from '@/components/@symbols';
import { Responder } from '@/components/responder';
import { tuple } from '@/utils';
import { multiGetOnRef, refArrayGetterOnRef, refGetterOnRef, refSetterOnRef, setColor } from '@/lua-functions';

const proxiedMethods = tuple(
    'close',
    'hasframe',
    'istransparent',
    'sethasshadow',
    'hasshadow',
    'setcontentview',
    'getcontentview',
    'center',
    'setcontentsize',
    'getcontentsize',
    'setbounds',
    'getbounds',
    'setsizeconstraints',
    'getsizeconstraints',
    'setcontentsizeconstraints',
    'getcontentsizeconstraints',
    'activate',
    'deactivate',
    'isactive',
    'setvisible',
    'isvisible',
    'setalwaysontop',
    'isalwaysontop',
    'setfullscreen',
    'isfullscreen',
    'maximize',
    'unmaximize',
    'ismaximized',
    'minimize',
    'restore',
    'isminimized',
    'setresizable',
    'isresizable',
    'setmaximizable',
    'ismaximizable',
    'setminimizable',
    'isminimizable',
    'setmovable',
    'ismovable',
    'settitle',
    'gettitle',
    'setbackgroundcolor',
    'settoolbar',
    'gettoolbar',
    'settitlevisible',
    'istitlevisible',
    'setfullsizecontentview',
    'isfullsizecontentview',
    'setskiptaskbar',
    'seticon',
    'setmenubar',
    'getmenubar',
    'getparentwindow',
    'addchildwindow',
    'removechildwindow',
    'getchildwindows',
);

const events = tuple(
    'close',
    'focus',
    'blur',
);

type WindowOptions = {
    /**
     * Whether window has native frame, default is `true`
     */
    frame?: boolean;
    /**
     * Whether window is transparent, default is `false`.
     * 
     * Only frameless window can be transparent, the behavior of making a normal window transparent is undefined
     */
    transparent?: boolean;
    /**
     * **`macOS`**
     * 
     * Whether to show window buttons for frameless window, default is `false`.
     * 
     * This property is ignored for normal windows
     */
    showtrafficlights?: boolean;
};

export class Window<
    Events extends string = never
> extends Responder<
    Events | typeof events[number]
> {
    protected get [eventListPropName](): string[] { return (events as string[]).concat(super[eventListPropName]) };

    constructor(options: WindowOptions) {
        super('return gui.Window.create(options)', ['options'], [options]);
    }

    protected async [initMethodName]() {
        await super[initMethodName]();
        const server = this[serverPropName];
        const luavar = this[luaVarRef];
        const proxied = await Promise.all([
            server.createFunction(`${luavar}:close()`, []),
            server.createFunction(`return ${luavar}:hasframe()`, []),
            server.createFunction(`return ${luavar}:istransparent()`, []),
            server.createFunction(`${luavar}:sethasshadow(has)`, ['has']),
            server.createFunction(`return ${luavar}:hasshadow()`, []),
            server.createFunction(...refSetterOnRef(luavar, 'setcontentview')),
            server.createFunction(...refGetterOnRef(luavar, 'getcontentview')),
            server.createFunction(`${luavar}:center()`, []),
            server.createFunction(`${luavar}:setcontentsize(size)`, ['size']),
            server.createFunction(`return ${luavar}:getcontentsize()`, []),
            server.createFunction(`${luavar}:setbounds(bounds)`, ['bounds']),
            server.createFunction(`return ${luavar}:getbounds()`, []),
            server.createFunction(`${luavar}:setsizeconstraints(minsize, maxsize)`, ['minsize', 'maxsize']),
            server.createFunction(...multiGetOnRef(luavar, 'getsizeconstraints', ['minsize', 'maxsize'])),
            server.createFunction(`${luavar}:setcontentsizeconstraints(minsize, maxsize)`, ['minsize', 'maxsize']),
            server.createFunction(...multiGetOnRef(luavar, 'getcontentsizeconstraints', ['minsize', 'maxsize'])),
            server.createFunction(`${luavar}:activate()`, []),
            server.createFunction(`${luavar}:deactivate()`, []),
            server.createFunction(`return ${luavar}:isactive()`, []),
            server.createFunction(`${luavar}:setvisible(visible)`, ['visible']),
            server.createFunction(`return ${luavar}:isvisible()`, []),
            server.createFunction(`${luavar}:setalwaysontop(top)`, ['top']),
            server.createFunction(`return ${luavar}:isalwaysontop()`, []),
            server.createFunction(`${luavar}:setfullscreen(fullscreen)`, ['fullscreen']),
            server.createFunction(`return ${luavar}:isfullscreen()`, []),
            server.createFunction(`${luavar}:maximize()`, []),
            server.createFunction(`${luavar}:unmaximize()`, []),
            server.createFunction(`return ${luavar}:ismaximized()`, []),
            server.createFunction(`${luavar}:minimize()`, []),
            server.createFunction(`${luavar}:restore()`, []),
            server.createFunction(`return ${luavar}:isminimized()`, []),
            server.createFunction(`${luavar}:setresizable(resizable)`, ['resizable']),
            server.createFunction(`return ${luavar}:isresizable()`, []),
            server.createFunction(`${luavar}:setmaximizable(maximizable)`, ['maximizable']),
            server.createFunction(`return ${luavar}:ismaximizable()`, []),
            server.createFunction(`${luavar}:setminimizable(minimizable)`, ['minimizable']),
            server.createFunction(`return ${luavar}:isminimizable()`, []),
            server.createFunction(`${luavar}:setmovable(movable)`, ['movable']),
            server.createFunction(`return ${luavar}:ismovable()`, []),
            server.createFunction(`${luavar}:settitle(title)`, ['title']),
            server.createFunction(`return ${luavar}:gettitle()`, []),
            server.createFunction(`return ${luavar}:gettitle()`, []),
            server.createFunction(...setColor(luavar, 'setbackgroundcolor')),
            server.createFunction(...refSetterOnRef(luavar, 'settoolbar')),
            server.createFunction(...refGetterOnRef(luavar, 'gettoolbar')),
            server.createFunction(`${luavar}:settitlevisible(visible)`, ['visible']),
            server.createFunction(`return ${luavar}:istitlevisible()`, []),
            server.createFunction(`${luavar}:setfullsizecontentview(full)`, ['full']),
            server.createFunction(`return ${luavar}:isfullsizecontentview()`, []),
            server.createFunction(`${luavar}:setskiptaskbar(skip)`, ['skip']),
            server.createFunction(...refSetterOnRef(luavar, 'seticon')),
            server.createFunction(...refSetterOnRef(luavar, 'setmenubar')),
            server.createFunction(...refGetterOnRef(luavar, 'getmenubar')),
            server.createFunction(...refGetterOnRef(luavar, 'getparentwindow')),
            server.createFunction(...refSetterOnRef(luavar, 'addchildwindow')),
            server.createFunction(...refSetterOnRef(luavar, 'removechildwindow')),
            server.createFunction(...refArrayGetterOnRef(luavar, 'getchildwindows')),
        ]);
        proxiedMethods.forEach((name, i) => this[name] = proxied[i]);
    }

    /**
     * Request to close the window
     */
    close: ServerLuaFunction<[], void>;

    /**
     * Return whether window has a native frame
     */
    hasframe: ServerLuaFunction<[], boolean>;

    /**
     * Return whether window is transparent
     */
    istransparent: ServerLuaFunction<[], boolean>;

    /**
     * Set whether window should have shadow.
     * 
     * Depending on platform, this may not work
     */
    sethasshadow: ServerLuaFunction<[has: boolean], void>;

    /**
     * Return whether window has shadow
     */
    hasshadow: ServerLuaFunction<[], boolean>;

    /**
     * Set the content view of the window.
     * 
     * The content view will always be resized to fill window's client area
     */
    setcontentview: ServerLuaFunction<[view: View<string>], void>;

    /**
     * Return the content view of the window
     */
    getcontentview: ServerLuaFunction<[], View<string>>;

    /**
     * Move the window to the center of the screen
     */
    center: ServerLuaFunction<[], void>;

    /**
     * Resize window to make the content view fit `size`
     */
    setcontentsize: ServerLuaFunction<[size: SizeF], void>;

    /**
     * Return the size of content view
     */
    getcontentsize: ServerLuaFunction<[size: SizeF], void>;

    /**
     * Change the position and size of the window
     */
    setbounds: ServerLuaFunction<[bounds: RectF], void>;

    /**
     * Return the position and size of the window
     */
    getbounds: ServerLuaFunction<[], RectF>;

    /**
     * Set the minimum and maximum sizes of the window.
     * 
     * Passing an empty size means no constraint
     */
    setsizeconstraints: ServerLuaFunction<[minsize: Optional<SizeF>, maxsize: Optional<SizeF>], void>;

    /**
     * Return minimum and maximum sizes of the window
     */
    getsizeconstraints: ServerLuaFunction<[], { minsize: Optional<SizeF> | null, maxsize: Optional<SizeF> | null }>;

    /**
     * Set the minimum and maximum sizes of the window.
     * 
     * Passing an empty size means no constraint
     */
    setcontentsizeconstraints: ServerLuaFunction<[minsize: Optional<SizeF>, maxsize: Optional<SizeF>], void>;

    /**
     * Return minimum and maximum sizes of the window
     */
    getcontentsizeconstraints: ServerLuaFunction<[], { minsize: Optional<SizeF> | null, maxsize: Optional<SizeF> | null }>;

    /**
     * Show the window and activate it
     */
    activate: ServerLuaFunction<[], void>;

    /**
     * Move the focus away from the window
     */
    deactivate: ServerLuaFunction<[], void>;

    /**
     * Return whether window has focus
     */
    isactive: ServerLuaFunction<[], boolean>;

    /**
     * Show/hide the window
     */
    setvisible: ServerLuaFunction<[visible: boolean], void>;

    /**
     * Return whether window is visible
     */
    isvisible: ServerLuaFunction<[], boolean>;

    /**
     * Show/hide the window
     */
    setalwaysontop: ServerLuaFunction<[top: boolean], void>;

    /**
     * Return whether window is visible
     */
    isalwaysontop: ServerLuaFunction<[], boolean>;

    /**
     * Enter/leave fullscreen state
     */
    setfullscreen: ServerLuaFunction<[fullscreen: boolean], void>;

    /**
     * Return whether window is in fullscreen
     */
    isfullscreen: ServerLuaFunction<[], boolean>;

    /**
     * Maximize the window
     */
    maximize: ServerLuaFunction<[], void>;

    /**
     * Unmaximize the window
     */
    unmaximize: ServerLuaFunction<[], void>;

    /**
     * Return whether window is maximized
     */
    ismaximized: ServerLuaFunction<[], boolean>;

    /**
     * Minimize the window
     */
    minimize: ServerLuaFunction<[], void>;

    /**
     * Restore the minimized window
     */
    restore: ServerLuaFunction<[], void>;

    /**
     * Return whether window is minimized
     */
    isminimized: ServerLuaFunction<[], boolean>;

    /**
     * Set whether window can be resized
     */
    setresizable: ServerLuaFunction<[resizable: boolean], void>;

    /**
     * Return whether window can be resized
     */
    isresizable: ServerLuaFunction<[], boolean>;

    /**
     * Set whether window can be maximize
     */
    setmaximizable: ServerLuaFunction<[maximizable: boolean], void>;

    /**
     * Return whether window can be maximize
     */
    ismaximizable: ServerLuaFunction<[], boolean>;

    /**
     * Set whether window can be minimized
     */
    setminimizable: ServerLuaFunction<[minimizable: boolean], void>;

    /**
     * Return whether window can be minimized
     */
    isminimizable: ServerLuaFunction<[], boolean>;

    /**
     * Set whether window can be moved
     */
    setmovable: ServerLuaFunction<[movable: boolean], void>;

    /**
     * Return whether window can be moved
     */
    ismovable: ServerLuaFunction<[], boolean>;

    /**
     * Set window title
     */
    settitle: ServerLuaFunction<[title: string], void>;

    /**
     * Get window title
     */
    gettitle: ServerLuaFunction<[], string>;

    /**
     * Set the background color of the window
     */
    setbackgroundcolor: ServerLuaFunction<[color: Color], void>;

    /**
     * **`macOS`**
     * 
     * Set the window toolbar
     */
    settoolbar: ServerLuaFunction<[toolbar: Toolbar], void>;

    /**
     * **`macOS`**
     * 
     * Return the window toolbar
     */
    gettoolbar: ServerLuaFunction<[], Toolbar>;

    /**
     * **`macOS`**
     * 
     * Set whether the title is visible, when title was hidden the toolber would be moved into the area previously occupied by the title
     */
    settitlevisible: ServerLuaFunction<[visible: boolean], void>;

    /**
     * **`macOS`**
     * 
     * Return whether title is visible
     */
    istitlevisible: ServerLuaFunction<[], boolean>;

    /**
     * **`macOS`**
     * 
     * Set the `NSFullSizeContentViewWindowMask` style on the window
     */
    setfullsizecontentview: ServerLuaFunction<[full: boolean], void>;

    /**
     * **`macOS`**
     * 
     * Return whether the window has `NSFullSizeContentViewWindowMask` style
     */
    isfullsizecontentview: ServerLuaFunction<[], boolean>;

    /**
     * **`Windows`** **`Linux`**
     * 
     * Set whether to hide the window from taskbar
     */
    setskiptaskbar: ServerLuaFunction<[skip: boolean], void>;

    /**
     * **`Windows`** **`Linux`**
     * 
     * Set the window icon
     */
    seticon: ServerLuaFunction<[icon: Image], void>;

    /**
     * **`Windows`** **`Linux`**
     * 
     * Set the window menu bar
     */
    setmenubar: ServerLuaFunction<[menubar: MenuBar], void>;

    /**
     * **`Windows`** **`Linux`**
     * 
     * Return the window menu bar
     */
    getmenubar: ServerLuaFunction<[], MenuBar>;

    /**
     * Return the parent window
     */
    getparentwindow: ServerLuaFunction<[], Window>;

    /**
     * Make `child` a child window of this window.
     * 
     * This method will do nothing if `child` already has a parent window
     */
    addchildwindow: ServerLuaFunction<[child: Window], void>;

    /**
     * Remove this window as `child`'s parent window
     */
    removechildwindow: ServerLuaFunction<[child: Window], void>;

    /**
     * Return all the child windows of this window
     */
    getchildwindows: ServerLuaFunction<[], Window[]>;

    async destroy() {
        if (!await this.initialized) return;
        await Promise.all(proxiedMethods.map((name) => this[name].destroy()));
        await super.destroy();
    }
}

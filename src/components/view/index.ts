import type { ServerLuaFunction } from 'yues-client';
import type { ClipboardData, DragOptions, RectF, Vector2dF, Color, SizeF } from '@/@types';
import type { Font } from '@/components/font';
import type { Window } from '@/components/window';
import { serverPropName, idPropName, luaVarRef, eventListPropName, initMethodName } from '@/components/@symbols';
import { ActiveRemoteElementsStorage } from '@/components/@element';
import { Responder } from '@/components/responder';
import { tuple } from '@/utils';
import * as lua from './lua-functions';

const proxiedMethods = tuple(
    'offsetfromview',
    'offsetfromwindow',
    'getbounds',
    'layout',
    'schedulepaint',
    'schedulepaintrect',
    'setvisible',
    'isvisible',
    'setenabled',
    'isenabled',
    'focus',
    'hasfocus',
    'setfocusable',
    'isfocusable',
    'setmousedowncanmovewindow',
    'ismousedowncanmovewindow',
    'dodrag',
    'dodragwithoptions',
    'canceldrag',
    'isdragging',
    'registerdraggedtypes',
    'setcursor',
    'setcolor',
    'setbackgroundcolor',
    'setstyle',
    'getcomputedlayout',
    'getminimumsize',
    'getparent',
    'getwindow',
);

const events = tuple(
    'dragleave',
    'sizechanged',
);

export class View<
    Events extends string = never
> extends Responder<
    Events | typeof events[number]
> {
    protected get [eventListPropName](): string[] { return (events as string[]).concat(super[eventListPropName]) };

    protected async [initMethodName]() {
        await super[initMethodName]();
        const server = this[serverPropName];
        const luavar = this[luaVarRef];
        const proxied = await Promise.all([
            server.createFunction(
                lua.offsetfromview(luavar),
                ['viewid'],
                async (func, view: View) => {
                    if (!await view.initialized) throw new Error('offsetfromview: view is not initialized');
                    return func(view[idPropName]);
                },
            ),
            server.createFunction(`return ${luavar}:offsetfromwindow()`, []),
            server.createFunction(`return ${luavar}:getbounds()`, []),
            server.createFunction(`${luavar}:layout()`, []),
            server.createFunction(`${luavar}:schedulepaint()`, []),
            server.createFunction(`${luavar}:schedulepaintrect(rect)`, ['rect']),
            server.createFunction(`${luavar}:setvisible(visible)`, ['visible']),
            server.createFunction(`return ${luavar}:isvisible()`, []),
            server.createFunction(`${luavar}:setenabled(enable)`, ['enable']),
            server.createFunction(`return ${luavar}:isenabled()`, []),
            server.createFunction(`${luavar}:focus()`, []),
            server.createFunction(`return ${luavar}:hasfocus()`, []),
            server.createFunction(`${luavar}:setfocusable(focusable)`, ['focusable']),
            server.createFunction(`return ${luavar}:isfocusable()`, []),
            server.createFunction(`${luavar}:setmousedowncanmovewindow(can)`, ['can']),
            server.createFunction(`return ${luavar}:ismousedowncanmovewindow()`, []),
            server.createFunction(
                lua.dodrag(luavar),
                ['data', 'operations'],
                async (func, data: ClipboardData, operations: number) => {
                    const fixedData = {
                        type: data.type,
                        value: data.type === 'image' ? data.value[idPropName] : data.value,
                    };
                    return func(fixedData, operations);
                },
            ),
            server.createFunction(
                lua.dodragwithoptions(luavar),
                ['data', 'operations', 'options'],
                async (func, data: ClipboardData, operations: number, options: DragOptions) => {
                    const fixedData = {
                        type: data.type,
                        value: data.type === 'image' ? data.value[idPropName] : data.value,
                    };
                    return func(fixedData, operations, options);
                },
            ),
            server.createFunction(`${luavar}:canceldrag()`, []),
            server.createFunction(`return ${luavar}:isdragging()`, []),
            server.createFunction(`${luavar}:registerdraggedtypes(types)`, ['types']),
            server.createFunction(
                lua.setcursor(luavar),
                ['cursorid'],
                (func, cursor: Font) => func(cursor[idPropName]),
            ),
            server.createFunction(
                lua.setcolor(luavar),
                ['color'],
                (func, color: Color) => func({
                    type: typeof color,
                    value: color,
                }),
            ),
            server.createFunction(
                lua.setbackgroundcolor(luavar),
                ['color'],
                (func, color: Color) => func({
                    type: typeof color,
                    value: color,
                }),
            ),
            server.createFunction(`${luavar}:setstyle(style)`, ['style']),
            server.createFunction(`return ${luavar}:getcomputedlayout()`, []),
            server.createFunction(`return ${luavar}:getminimumsize()`, []),
            server.createFunction(
                lua.getparent(luavar),
                [],
                async (func) => ActiveRemoteElementsStorage[await func()],
            ),
            server.createFunction(
                lua.getwindow(luavar),
                [],
                async (func) => ActiveRemoteElementsStorage[await func()],
            ),
        ]);
        proxiedMethods.forEach((name, i) => this[name] = proxied[i]);
    }

    /**
     * Return offset from `view`
     */
    offsetfromview: ServerLuaFunction<[view: View<any>], Vector2dF>;

    /**
     * Return offset from the window that owns the view
     */
    offsetfromwindow: ServerLuaFunction<[], Vector2dF>;

    /**
     * Return the position and size of the view, relative to its parent
     */
    getbounds: ServerLuaFunction<[], RectF>;

    /**
     * Make the view re-recalculate its layout
     */
    layout: ServerLuaFunction<[], void>;

    /**
     * Schedule to repaint the whole view
     */
    schedulepaint: ServerLuaFunction<[], void>;

    /**
     * Schedule to repaint the `rect` area in view
     */
    schedulepaintrect: ServerLuaFunction<[rect: RectF], void>;

    /**
     * Show/Hide the view
     */
    setvisible: ServerLuaFunction<[visible: boolean], void>;

    /**
     * Return whether the view is visible
     */
    isvisible: ServerLuaFunction<[], boolean>;

    /**
     * Set whether the view is enabled.
     * 
     * The enabled state of each view is not affected by its parent, disabling a container-like view does not have any effect
     */
    setenabled: ServerLuaFunction<[enable: boolean], void>;

    /**
     * Return whether the view is enabled
     */
    isenabled: ServerLuaFunction<[], boolean>;

    /**
     * Move the keyboard focus to the view
     */
    focus: ServerLuaFunction<[], void>;

    /**
     * Return whether the view has keyboard focus
     */
    hasfocus: ServerLuaFunction<[], boolean>;

    /**
     * Set whether the view can be focused on
     */
    setfocusable: ServerLuaFunction<[focusable: boolean], void>;

    /**
     * Return whether the view can be focused on
     */
    isfocusable: ServerLuaFunction<[], boolean>;

    /**
     * Set whether dragging mouse would move the window.
     * 
     * For most platforms this method only works for frameless windows, having this feature may also prevent mouse events to happen.
     * 
     * On macOS the `Container` view has this feature turned on by default. To turn this feature on for the view, the view's parent view must also has this feature turned on.
     * 
     * On Windows the view with this feature will be treated as titlebar, e.g. double-clicking would maximize the window, right-clicking may show the system menu
     */
    setmousedowncanmovewindow: ServerLuaFunction<[can: boolean], void>;

    /**
     * Return whether dragging the view would move the window
     */
    ismousedowncanmovewindow: ServerLuaFunction<[], boolean>;

    /**
     * Start a drag session but do not set drag image.
     * 
     * The return value is an integer indicating the result of dragging.
     * 
     * This method should only be called in the `mousedown` event, when user starts to drag the cursor.
     * 
     * Note that on macOS certain views may have `ismousedowncanmovewindow` defaulting to `true`, which will prevent drag session to start.
     * Make sure to call `setmousedowncanmovewindow(false)` for drag sources
     */
    dodrag: ServerLuaFunction<[data: ClipboardData, operations: number], number>;

    /**
     * Start a drag session.
     * 
     * The return value is an integer indicating the result of dragging.
     * 
     * This method should only be called in the `mousedown` event, when user starts to drag the cursor.
     * 
     * Note that on macOS certain views may have `ismousedowncanmovewindow` defaulting to `true`, which will prevent drag session to start.
     * Make sure to call `setmousedowncanmovewindow(false)` for drag sources
     */
    dodragwithoptions: ServerLuaFunction<[data: ClipboardData, operations: number, options: DragOptions], number>;

    /**
     * Cancel current drag session if the view is being used as drag source
     */
    canceldrag: ServerLuaFunction<[], void>;

    /**
     * Return whether the view is being used as drag source
     */
    isdragging: ServerLuaFunction<[], boolean>;

    /**
     * Make the view a drag destination that accepts `types`
     */
    registerdraggedtypes: ServerLuaFunction<[types: ClipboardData['type'][]], void>;

    /**
     * Set the cursor to show when hovering the view.
     * 
     * On Linux, setting cursor would force the view to own its own GDK window. For certain views like `Label`, this may have remove the view's background color
     */
    setcursor: ServerLuaFunction<[cursor: Font], void>;

    /**
     * Change the color used for drawing text in the view.
     * 
     * This methods only works for `View`s that display text, like `Label` or `Entry`
     */
    setcolor: ServerLuaFunction<[color: Color], void>;

    /**
     * Change the background color of the view
     */
    setbackgroundcolor: ServerLuaFunction<[color: Color], void>;

    /**
     * Change the styles of the view.
     * 
     * Available style properties can be found at [Layout System](https://libyue.com/docs/v0.11.0/lua/guides/layout_system.html)
     */
    setstyle: ServerLuaFunction<[styles: Record<string, number | string>], void>;

    /**
     * Return string representation of the view's layout
     */
    getcomputedlayout: ServerLuaFunction<[], string>;

    /**
     * Return the minimum size needed to show the view
     */
    getminimumsize: ServerLuaFunction<[], SizeF>;

    /**
     * Return parent view
     */
    getparent: ServerLuaFunction<[], View>;

    /**
     * Return the window that the view belongs to
     */
    getwindow: ServerLuaFunction<[], Window>;

    async destroy() {
        if (!await this.initialized) return;
        await Promise.all(proxiedMethods.map((name) => this[name].destroy()));
        await super.destroy();
    }
}

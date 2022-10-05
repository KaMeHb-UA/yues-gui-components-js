import type { Server } from 'yues-client';
import type { MinimalEventEmitter, MinimalEventEmitterConstructor } from '@/@types';
import { LUA_GET_FROM_GLOBAL_STORAGE_FUNC_NAME } from '@/constants';
import { serverPropName, idPropName, luaVarRef, eventListPropName, initMethodName } from '@/components/@symbols';
import { elementInit, bindEvent as bindEventDef } from '@/lua-functions';
import { platform } from '@/platform';

export const ActiveRemoteElementsStorage = Object.create(null) as {
    [id: string]: RemoteElement<string>;
};

// private symbols
const eventEmitterPropName = Symbol('[[EventEmitter]]');
const serverMessageListenerName = Symbol('[[ServerMessageListener]]');

type IncomingMessage = {
    targetRef: string;
    event: string;
    data: any[];
};

async function basicInit(this: RemoteElement, initBody: string, initArgNames: string[], initArgs: any[]) {
    const { server, EventEmitter } = await platform;
    // assign props
    this[serverPropName] = server;
    this[eventEmitterPropName] = new EventEmitter();
    // execute provided lua init function
    const func = await server.createFunction(initBody, initArgNames);
    this[idPropName] = await server.exec(
        ...elementInit(),
        [func.ref, initArgs],
    );
    this[luaVarRef] = `${LUA_GET_FROM_GLOBAL_STORAGE_FUNC_NAME}('${this[idPropName]}')`;
    ActiveRemoteElementsStorage[this[idPropName]] = this;
    await func.destroy();
    // set listeners
    server.onMessage(this[serverMessageListenerName]);
    // bind events
    const bindEvent = await server.createFunction(...bindEventDef(this[luaVarRef]));
    await Promise.all(this[eventListPropName].map(v => bindEvent(v, this[idPropName])));
    await bindEvent.destroy();
    // call external init
    await this[initMethodName]();
    return true;
}

export abstract class RemoteElement<Events extends string = never> {
    private [eventEmitterPropName]: MinimalEventEmitter;

    protected [serverPropName]: Server;
    protected get [eventListPropName](): string[] { return [] };

    /** Promise or value that defines if component is initialized and not yet destroyed */
    initialized: Promise<boolean> | boolean;

    [idPropName]: string;
    [luaVarRef]: string;

    constructor(
        initBody: string,
        initArgNames: string[],
        initArgs: any[],
    ) {
        this.initialized = basicInit.call(
            this,
            initBody,
            initArgNames,
            initArgs,
        );
    }

    private [serverMessageListenerName] = (message: IncomingMessage) => {
        const { targetRef, event, data } = message;
        if (targetRef !== this[idPropName]) return;
        this[eventEmitterPropName].emit(event, data);
    }

    protected abstract [initMethodName](): Promise<void> | void;

    on(event: Events, callback: (data: any) => void) {
        this[eventEmitterPropName].on(event, callback);
    }

    once(event: Events, callback: (data: any) => void) {
        this[eventEmitterPropName].once(event, callback);
    }

    off(event: Events, callback: (data: any) => void) {
        this[eventEmitterPropName].off(event, callback);
    }

    /**
     * Destroy instance of component
     */
    async destroy() {
        if(!await this.initialized) return;
        delete ActiveRemoteElementsStorage[this[idPropName]];
        this.initialized = false;
        this[serverPropName].offMessage(this[serverMessageListenerName]);
        await this[serverPropName].exec(`${this[luaVarRef]} = nil`, [], []);
        delete this[serverPropName];
    }
}

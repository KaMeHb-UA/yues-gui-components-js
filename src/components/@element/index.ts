import type { Server } from 'yues-client';
import type { EventEmitter as EventEmitterConstructor } from 'node:events';
import { LUA_GLOBAL_STORAGE_VAR_NAME } from '@/constants';
import { serverPropName, idPropName, luaVarRef, eventListPropName, initMethodName } from '@/components/@symbols';
import { initFunc, bindEventFunc } from './lua-functions';

// private symbols
const eventEmitterPropName = Symbol('[[EventEmitter]]');
const serverMessageListenerName = Symbol('[[ServerMessageListener]]');

type IncomingMessage = {
    targetRef: string;
    event: string;
    data: any[];
};

async function basicInit(this: RemoteElement, initBody: string, initArgNames: string[], initArgs: any[]) {
    const server = this[serverPropName];
    // execute provided lua init function
    const func = await server.createFunction(initBody, initArgNames);
    await server.exec(
        initFunc(this[luaVarRef]),
        ['ref', 'args'],
        [func.ref, initArgs],
    );
    await func.destroy();
    // set listeners
    server.onMessage(this[serverMessageListenerName]);
    // bind events
    const bindEvent = await server.createFunction(
        bindEventFunc(this[luaVarRef]),
        ['event', 'targetRef'],
    );
    await Promise.all(this[eventListPropName].map(v => bindEvent(v, this[idPropName])));
    await bindEvent.destroy();
}

export abstract class RemoteElement<Events extends string = never> {
    private [eventEmitterPropName]: EventEmitterConstructor;

    protected [serverPropName]: Server;
    protected readonly [eventListPropName]: string[] = [];

    readonly [idPropName] = crypto.randomUUID();
    readonly [luaVarRef] = `${LUA_GLOBAL_STORAGE_VAR_NAME}['${this[idPropName]}']`;

    /** Promise or value that defines if component is initialized and not yet destroyed */
    initialized: Promise<boolean> | boolean;

    constructor(
        server: Server,
        EventEmitter: typeof EventEmitterConstructor,
        initBody: string,
        initArgNames: string[],
        initArgs: any[],
    ) {
        this[serverPropName] = server;
        this[eventEmitterPropName] = new EventEmitter();
        this.initialized = basicInit.call(
            this,
            initBody,
            initArgNames,
            initArgs,
        ).then(async () => {
            await this[initMethodName]();
            return true;
        });
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
        this.initialized = false;
        this[serverPropName].offMessage(this[serverMessageListenerName]);
        await this[serverPropName].exec(`${this[luaVarRef]} = nil`, [], []);
        delete this[serverPropName];
    }
}
type Listener = (data: any) => void;

export interface MinimalEventEmitter {
    emit(event: string, data: any): void
    on(event: string, callback: Listener): void
    once(event: string, callback: Listener): void
    off(event: string, callback: Listener): void
}

export interface MinimalEventEmitterConstructor {
    new(...args: any[]): MinimalEventEmitter
}

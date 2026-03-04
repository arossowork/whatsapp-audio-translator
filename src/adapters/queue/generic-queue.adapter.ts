import { Injectable } from '@nestjs/common';

@Injectable()
export class GenericQueueAdapter<T> {
    private readonly listeners: ((item: T) => void)[] = [];

    enqueue(item: T): void {
        for (const listener of this.listeners) {
            listener(item);
        }
    }

    subscribe(callback: (item: T) => void): void {
        this.listeners.push(callback);
    }
}

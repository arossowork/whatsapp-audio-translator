import { Injectable } from '@nestjs/common';

@Injectable()
export class GenericQueueAdapter<T> {
    private readonly store: T[] = [];

    enqueue(item: T): void {
        this.store.push(item);
    }

    dequeue(): T | null {
        return this.store.shift() ?? null;
    }
}

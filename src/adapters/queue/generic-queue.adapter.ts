import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GenericQueueAdapter<T> {
    private readonly logger = new Logger(GenericQueueAdapter.name);
    private readonly listeners: ((item: T) => void)[] = [];

    enqueue(item: T): void {
        this.logger.debug(`Enqueuing item — notifying ${this.listeners.length} listener(s)`);
        for (const listener of this.listeners) {
            listener(item);
        }
    }

    subscribe(callback: (item: T) => void): void {
        this.listeners.push(callback);
        this.logger.log(`New subscriber registered — total=${this.listeners.length}`);
    }
}

import { Injectable } from '@nestjs/common';
import { DaprService } from '../../providers/dapr/dapr.service';

@Injectable()
export class DaprQueueAdapter<T> {
    private readonly listeners: ((item: T) => void)[] = [];
    private isSubscribed = false;

    constructor(
        private readonly daprService: DaprService,
        private readonly pubsubName: string,
        private readonly topicName: string,
    ) { }

    async enqueue(item: T): Promise<void> {
        // Dapr client publish expects object or string.
        await this.daprService.client.pubsub.publish(this.pubsubName, this.topicName, item as any);
    }

    subscribe(callback: (item: T) => void): void {
        this.listeners.push(callback);

        if (!this.isSubscribed) {
            this.isSubscribed = true;
            this.daprService.server.pubsub.subscribe(
                this.pubsubName,
                this.topicName,
                async (data: T) => {
                    for (const listener of this.listeners) {
                        listener(data);
                    }
                },
            );
        }
    }
}

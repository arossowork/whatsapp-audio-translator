import { Injectable, Logger } from '@nestjs/common';
import { DaprService } from '../dapr/dapr.service';

@Injectable()
export class DaprQueueAdapter<T> {
    private readonly logger = new Logger(DaprQueueAdapter.name);
    private readonly listeners: ((item: T) => void)[] = [];
    private isSubscribed = false;

    constructor(
        private readonly daprService: DaprService,
        private readonly pubsubName: string,
        private readonly topicName: string,
    ) { }

    async enqueue(item: T): Promise<void> {
        this.logger.log(`Publishing to ${this.pubsubName}/${this.topicName}`);

        // Pass item as a plain object to prevent Dapr SDK from calling .toString() on class instances and sending "[object Object]"
        const plainObject = JSON.parse(JSON.stringify(item));
        await this.daprService.client.pubsub.publish(this.pubsubName, this.topicName, plainObject);
        this.logger.debug(`Published to ${this.pubsubName}/${this.topicName}`);
    }

    subscribe(callback: (item: T) => void): void {
        this.listeners.push(callback);
        this.logger.log(`Subscriber registered for ${this.pubsubName}/${this.topicName} — total=${this.listeners.length}`);

        if (!this.isSubscribed) {
            this.isSubscribed = true;
            this.logger.log(`Setting up Dapr subscription for ${this.pubsubName}/${this.topicName}`);
            this.daprService.server.pubsub.subscribe(
                this.pubsubName,
                this.topicName,
                async (data: any) => {
                    this.logger.debug(`Received message from ${this.pubsubName}/${this.topicName} — notifying ${this.listeners.length} listener(s)`);

                    let parsedData = data;

                    try {
                        let toLog = data;
                        if (typeof data === 'object' && data !== null) {
                            toLog = Array.isArray(data) ? '[ARRAY]' : { ...data };
                            if (toLog.data && toLog.data.audioContent) toLog.data.audioContent = '[TRUNCATED]';
                            if (toLog.audioContent) toLog.audioContent = '[TRUNCATED]';
                        }
                        console.log(`[DaprQueueAdapter] raw data type: ${typeof data}, isArray: ${Array.isArray(data)}, value:`, JSON.stringify(toLog, null, 2).substring(0, 1000));
                    } catch (e) {
                        console.log('[DaprQueueAdapter DEBUG] failed to log data', e);
                    }

                    if (data && typeof data === 'object') {
                        // Check if it's still wrapped in a CloudEvent or contains a data wrapper
                        if ('data' in data && data.data) {
                            console.log('[DaprQueueAdapter DEBUG] unwrapping data from payload');
                            parsedData = data.data;
                        }
                    }

                    if (typeof parsedData === 'string') {
                        try {
                            parsedData = JSON.parse(parsedData);
                        } catch (e) {
                            // If it fails to parse, just pass it as is
                        }
                    }

                    for (const listener of this.listeners) {
                        listener(parsedData as T);
                    }
                },
            );
        }
    }
}

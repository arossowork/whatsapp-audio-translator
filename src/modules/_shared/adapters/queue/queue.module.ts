import { Module } from '@nestjs/common';
import { DaprModule } from '../dapr/dapr.module';
import { DaprQueueAdapter } from './dapr-queue.adapter';

@Module({
    imports: [DaprModule],
    providers: [],
    exports: [DaprModule],
})
export class QueueModule { }

export * from './dapr-queue.adapter';
export * from './generic-queue.adapter';

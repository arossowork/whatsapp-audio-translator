import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { DaprModule } from '../../providers/dapr/dapr.module';
import { GenericQueueAdapter } from './generic-queue.adapter';

@Module({
    imports: [CoreModule, DaprModule],
    providers: [GenericQueueAdapter], // keeping generic around if used elsewhere
    exports: [GenericQueueAdapter, DaprModule],
})
export class QueueModule { }

export * from './dapr-queue.adapter';
export * from './generic-queue.adapter';

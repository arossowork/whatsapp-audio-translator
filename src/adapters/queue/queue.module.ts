import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { QUEUE_PORT } from '../../core/ports/tokens';
import { QueueAdapter } from './queue.adapter';
import { QueueJobPoller } from './queue-job.poller';

@Module({
    imports: [CoreModule],
    providers: [
        { provide: QUEUE_PORT, useClass: QueueAdapter },
        QueueJobPoller,
    ],
})
export class QueueModule { }

import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { REPLY_QUEUE_PORT } from '../../core/ports/tokens';
import { ReplyQueueAdapter } from './reply-queue.adapter';
import { ReplyQueuePoller } from './reply-queue.poller';

@Module({
    imports: [CoreModule],
    providers: [
        { provide: REPLY_QUEUE_PORT, useClass: ReplyQueueAdapter },
        ReplyQueuePoller,
    ],
})
export class ReplyQueueModule { }

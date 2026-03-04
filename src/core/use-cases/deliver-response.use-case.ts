import { Inject, Injectable } from '@nestjs/common';
import { ApiReplyPort } from '../ports/api-reply.port';
import { ReplyQueuePort } from '../ports/reply-queue.port';
import { API_REPLY_PORT, REPLY_QUEUE_PORT } from '../ports/tokens';

@Injectable()
export class DeliverResponseUseCase {
    constructor(
        @Inject(REPLY_QUEUE_PORT) private readonly replyQueue: ReplyQueuePort,
        @Inject(API_REPLY_PORT) private readonly apiReply: ApiReplyPort,
    ) { }

    execute(): void {
        const reply = this.replyQueue.dequeueReply();
        if (!reply) return;

        this.apiReply.deliverReply(reply);
    }
}

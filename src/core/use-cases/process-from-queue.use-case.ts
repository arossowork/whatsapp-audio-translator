import { Inject, Injectable } from '@nestjs/common';
import { LlmPort } from '../ports/llm.port';
import { QueuePort } from '../ports/queue.port';
import { ReplyQueuePort } from '../ports/reply-queue.port';
import { LLM_PORT, QUEUE_PORT, REPLY_QUEUE_PORT } from '../ports/tokens';

@Injectable()
export class ProcessFromQueueUseCase {
    constructor(
        @Inject(QUEUE_PORT) private readonly queue: QueuePort,
        @Inject(LLM_PORT) private readonly llm: LlmPort,
        @Inject(REPLY_QUEUE_PORT) private readonly replyQueue: ReplyQueuePort,
    ) { }

    async execute(): Promise<void> {
        const message = this.queue.dequeue();
        if (!message) return;

        const reply = await this.llm.process(message);
        this.replyQueue.enqueueReply(reply);
    }
}

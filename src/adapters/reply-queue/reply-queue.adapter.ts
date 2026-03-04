import { Injectable } from '@nestjs/common';
import { Message } from '../../core/domain/message.entity';
import { ReplyQueuePort } from '../../core/ports/reply-queue.port';

@Injectable()
export class ReplyQueueAdapter implements ReplyQueuePort {
    private readonly store: Message[] = [];

    enqueueReply(message: Message): void {
        this.store.push(message);
    }

    dequeueReply(): Message | null {
        return this.store.shift() ?? null;
    }
}

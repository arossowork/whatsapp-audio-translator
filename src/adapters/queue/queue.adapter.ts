import { Injectable } from '@nestjs/common';
import { Message } from '../../core/domain/message.entity';
import { QueuePort } from '../../core/ports/queue.port';

@Injectable()
export class QueueAdapter implements QueuePort {
    private readonly store: Message[] = [];

    enqueue(message: Message): void {
        this.store.push(message);
    }

    dequeue(): Message | null {
        return this.store.shift() ?? null;
    }
}

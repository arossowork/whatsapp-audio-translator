import { Injectable } from '@nestjs/common';
import { Message } from '../domain/message.entity';
import { QueuePort } from '../ports/queue.port';
import { QUEUE_PORT } from '../ports/tokens';
import { Inject } from '@nestjs/common';

@Injectable()
export class SendToQueueUseCase {
    constructor(@Inject(QUEUE_PORT) private readonly queue: QueuePort) { }

    execute(message: Message): void {
        this.queue.enqueue(message);
    }
}

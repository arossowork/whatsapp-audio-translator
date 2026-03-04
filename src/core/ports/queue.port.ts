import { Message } from '../domain/message.entity';

export abstract class QueuePort {
    abstract enqueue(message: Message): void;
    abstract dequeue(): Message | null;
}

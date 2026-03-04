import { Message } from '../domain/message.entity';

export abstract class ReplyQueuePort {
    abstract enqueueReply(message: Message): void;
    abstract dequeueReply(): Message | null;
}

import { Message } from '../domain/message.entity';

export abstract class ApiReplyPort {
    abstract deliverReply(message: Message): void;
}

import { Message } from '../domain/message.entity';

export abstract class LlmPort {
    abstract process(message: Message): Promise<Message>;
}

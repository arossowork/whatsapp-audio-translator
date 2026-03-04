import { Injectable } from '@nestjs/common';
import { Message } from '../../core/domain/message.entity';
import { ApiReplyPort } from '../../core/ports/api-reply.port';

/**
 * Implements ApiReplyPort — receives replies from core and buffers them
 * so the HTTP layer can serve them via GET /replies.
 */
@Injectable()
export class ApiReplyAdapter implements ApiReplyPort {
    private readonly replies: Message[] = [];

    deliverReply(message: Message): void {
        this.replies.push(message);
    }

    getReplies(): Message[] {
        return [...this.replies];
    }
}

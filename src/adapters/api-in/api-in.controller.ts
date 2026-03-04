import { Body, Controller, Get, Post } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Message } from '../../core/domain/message.entity';
import { SendToQueueUseCase } from '../../core/use-cases/send-to-queue.use-case';
import { ApiReplyAdapter } from './api-reply.adapter';

export class SendMessageDto {
    payload!: string;
}

@Controller('messages')
export class ApiInController {
    constructor(
        private readonly sendToQueue: SendToQueueUseCase,
        private readonly apiReply: ApiReplyAdapter,
    ) { }

    /**
     * POST /messages
     * Accepts a payload, wraps it in a Message and sends it to the job queue.
     */
    @Post()
    send(@Body() dto: SendMessageDto): { id: string; status: string } {
        const message = new Message(randomUUID(), dto.payload);
        this.sendToQueue.execute(message);
        return { id: message.id, status: message.status };
    }

    /**
     * GET /messages/replies
     * Returns all replies buffered by ApiReplyAdapter.
     */
    @Get('replies')
    getReplies(): Message[] {
        return this.apiReply.getReplies();
    }
}

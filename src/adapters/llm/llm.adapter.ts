import { Injectable } from '@nestjs/common';
import { Message } from '../../core/domain/message.entity';
import { LlmPort } from '../../core/ports/llm.port';

/**
 * Mock LLM adapter.
 * Simulates async processing with a 100ms delay.
 * Replace with a real OpenAI / Gemini / custom client when ready.
 */
@Injectable()
export class LlmAdapter implements LlmPort {
    async process(message: Message): Promise<Message> {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return new Message(
            message.id,
            `[LLM processed] ${message.payload}`,
            'completed',
            message.createdAt,
        );
    }
}

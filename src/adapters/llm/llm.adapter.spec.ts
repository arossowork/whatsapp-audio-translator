import { Message } from '../../core/domain/message.entity';
import { LlmAdapter } from './llm.adapter';

describe('LlmAdapter', () => {
    let adapter: LlmAdapter;

    beforeEach(() => {
        adapter = new LlmAdapter();
    });

    it('should return a message with "[LLM processed]" prefix in the payload', async () => {
        const input = new Message('1', 'hello world');

        const result = await adapter.process(input);

        expect(result.id).toBe(input.id);
        expect(result.payload).toBe('[LLM processed] hello world');
        expect(result.status).toBe('completed');
    });
});

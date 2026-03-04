import { Message } from '../domain/message.entity';
import { LlmPort } from '../ports/llm.port';
import { QueuePort } from '../ports/queue.port';
import { ReplyQueuePort } from '../ports/reply-queue.port';
import { ProcessFromQueueUseCase } from './process-from-queue.use-case';

describe('ProcessFromQueueUseCase', () => {
    let useCase: ProcessFromQueueUseCase;
    let fakeQueue: jest.Mocked<QueuePort>;
    let fakeLlm: jest.Mocked<LlmPort>;
    let fakeReplyQueue: jest.Mocked<ReplyQueuePort>;

    beforeEach(() => {
        fakeQueue = { enqueue: jest.fn(), dequeue: jest.fn() };
        fakeLlm = { process: jest.fn() };
        fakeReplyQueue = { enqueueReply: jest.fn(), dequeueReply: jest.fn() };
        useCase = new ProcessFromQueueUseCase(fakeQueue, fakeLlm, fakeReplyQueue);
    });

    it('should do nothing when the queue is empty', async () => {
        fakeQueue.dequeue.mockReturnValue(null);

        await useCase.execute();

        expect(fakeLlm.process).not.toHaveBeenCalled();
        expect(fakeReplyQueue.enqueueReply).not.toHaveBeenCalled();
    });

    it('should dequeue a message, send it to LLM, then enqueue the reply', async () => {
        const incoming = new Message('1', 'hello');
        const llmReply = new Message('1', '[LLM processed] hello', 'completed');
        fakeQueue.dequeue.mockReturnValue(incoming);
        fakeLlm.process.mockResolvedValue(llmReply);

        await useCase.execute();

        expect(fakeQueue.dequeue).toHaveBeenCalledTimes(1);
        expect(fakeLlm.process).toHaveBeenCalledWith(incoming);
        expect(fakeReplyQueue.enqueueReply).toHaveBeenCalledWith(llmReply);
    });
});

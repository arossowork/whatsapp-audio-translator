import { Message } from '../domain/message.entity';
import { ApiReplyPort } from '../ports/api-reply.port';
import { ReplyQueuePort } from '../ports/reply-queue.port';
import { DeliverResponseUseCase } from './deliver-response.use-case';

describe('DeliverResponseUseCase', () => {
    let useCase: DeliverResponseUseCase;
    let fakeReplyQueue: jest.Mocked<ReplyQueuePort>;
    let fakeApiReply: jest.Mocked<ApiReplyPort>;

    beforeEach(() => {
        fakeReplyQueue = { enqueueReply: jest.fn(), dequeueReply: jest.fn() };
        fakeApiReply = { deliverReply: jest.fn() };
        useCase = new DeliverResponseUseCase(fakeReplyQueue, fakeApiReply);
    });

    it('should do nothing when the reply queue is empty', () => {
        fakeReplyQueue.dequeueReply.mockReturnValue(null);

        useCase.execute();

        expect(fakeApiReply.deliverReply).not.toHaveBeenCalled();
    });

    it('should dequeue a reply and deliver it to the API-in adapter', () => {
        const reply = new Message('1', '[LLM processed] hello', 'completed');
        fakeReplyQueue.dequeueReply.mockReturnValue(reply);

        useCase.execute();

        expect(fakeReplyQueue.dequeueReply).toHaveBeenCalledTimes(1);
        expect(fakeApiReply.deliverReply).toHaveBeenCalledWith(reply);
    });
});

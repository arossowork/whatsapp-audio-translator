import { Message } from '../domain/message.entity';
import { QueuePort } from '../ports/queue.port';
import { SendToQueueUseCase } from './send-to-queue.use-case';

describe('SendToQueueUseCase', () => {
    let useCase: SendToQueueUseCase;
    let fakeQueue: jest.Mocked<QueuePort>;

    beforeEach(() => {
        fakeQueue = {
            enqueue: jest.fn(),
            dequeue: jest.fn(),
        };
        useCase = new SendToQueueUseCase(fakeQueue);
    });

    it('should enqueue the message via the QueuePort', () => {
        const message = new Message('1', 'hello');

        useCase.execute(message);

        expect(fakeQueue.enqueue).toHaveBeenCalledTimes(1);
        expect(fakeQueue.enqueue).toHaveBeenCalledWith(message);
    });

    it('should not call dequeue', () => {
        const message = new Message('2', 'world');

        useCase.execute(message);

        expect(fakeQueue.dequeue).not.toHaveBeenCalled();
    });
});

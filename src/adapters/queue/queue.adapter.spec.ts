import { Message } from '../../core/domain/message.entity';
import { QueueAdapter } from './queue.adapter';

describe('QueueAdapter', () => {
    let adapter: QueueAdapter;

    beforeEach(() => {
        adapter = new QueueAdapter();
    });

    it('should return null when the queue is empty', () => {
        expect(adapter.dequeue()).toBeNull();
    });

    it('should enqueue and dequeue a message (FIFO)', () => {
        const first = new Message('1', 'first');
        const second = new Message('2', 'second');

        adapter.enqueue(first);
        adapter.enqueue(second);

        expect(adapter.dequeue()).toBe(first);
        expect(adapter.dequeue()).toBe(second);
        expect(adapter.dequeue()).toBeNull();
    });
});

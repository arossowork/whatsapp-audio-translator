import { GenericQueueAdapter } from './generic-queue.adapter';

describe('GenericQueueAdapter', () => {
    let adapter: GenericQueueAdapter<string>;

    beforeEach(() => {
        adapter = new GenericQueueAdapter<string>();
    });

    it('should return null when the queue is empty', () => {
        expect(adapter.dequeue()).toBeNull();
    });

    it('should enqueue and dequeue a message (FIFO)', () => {
        const first = 'first payload';
        const second = 'second payload';

        adapter.enqueue(first);
        adapter.enqueue(second);

        expect(adapter.dequeue()).toBe(first);
        expect(adapter.dequeue()).toBe(second);
        expect(adapter.dequeue()).toBeNull();
    });
});

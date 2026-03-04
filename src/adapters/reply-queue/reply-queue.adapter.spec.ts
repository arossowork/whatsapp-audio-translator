import { Message } from '../../core/domain/message.entity';
import { ReplyQueueAdapter } from './reply-queue.adapter';

describe('ReplyQueueAdapter', () => {
    let adapter: ReplyQueueAdapter;

    beforeEach(() => {
        adapter = new ReplyQueueAdapter();
    });

    it('should return null when the reply queue is empty', () => {
        expect(adapter.dequeueReply()).toBeNull();
    });

    it('should enqueue and dequeue a reply (FIFO)', () => {
        const r1 = new Message('1', '[LLM] hello', 'completed');
        const r2 = new Message('2', '[LLM] world', 'completed');

        adapter.enqueueReply(r1);
        adapter.enqueueReply(r2);

        expect(adapter.dequeueReply()).toBe(r1);
        expect(adapter.dequeueReply()).toBe(r2);
        expect(adapter.dequeueReply()).toBeNull();
    });
});

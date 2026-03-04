import { Message } from '../../core/domain/message.entity';
import { ApiReplyAdapter } from './api-reply.adapter';

describe('ApiReplyAdapter', () => {
    let adapter: ApiReplyAdapter;

    beforeEach(() => {
        adapter = new ApiReplyAdapter();
    });

    it('should start with an empty reply buffer', () => {
        expect(adapter.getReplies()).toEqual([]);
    });

    it('should store a delivered reply', () => {
        const reply = new Message('1', '[LLM processed] hi', 'completed');

        adapter.deliverReply(reply);

        expect(adapter.getReplies()).toHaveLength(1);
        expect(adapter.getReplies()[0]).toBe(reply);
    });

    it('should accumulate multiple replies in order', () => {
        const r1 = new Message('1', 'a', 'completed');
        const r2 = new Message('2', 'b', 'completed');

        adapter.deliverReply(r1);
        adapter.deliverReply(r2);

        expect(adapter.getReplies()).toEqual([r1, r2]);
    });
});

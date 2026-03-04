import { Message } from './message.entity';

describe('Message', () => {
    it('should create with default status "pending"', () => {
        const msg = new Message('1', 'hello');
        expect(msg.id).toBe('1');
        expect(msg.payload).toBe('hello');
        expect(msg.status).toBe('pending');
        expect(msg.createdAt).toBeInstanceOf(Date);
    });

    it('should create with an explicit status', () => {
        const msg = new Message('2', 'hi', 'completed');
        expect(msg.status).toBe('completed');
    });

    it('withStatus() should return a new Message with updated status', () => {
        const original = new Message('3', 'test', 'pending');
        const updated = original.withStatus('processing');

        expect(updated.status).toBe('processing');
        expect(updated.id).toBe(original.id);
        expect(updated.payload).toBe(original.payload);
        // original is unchanged (immutability)
        expect(original.status).toBe('pending');
    });
});

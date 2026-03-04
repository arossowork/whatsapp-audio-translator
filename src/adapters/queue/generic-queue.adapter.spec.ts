import { GenericQueueAdapter } from './generic-queue.adapter';

describe('GenericQueueAdapter (Observer Pattern)', () => {
    let adapter: GenericQueueAdapter<string>;

    beforeEach(() => {
        adapter = new GenericQueueAdapter<string>();
    });

    it('should fire the subscribed callback when an item is enqueued', () => {
        const callback = jest.fn();
        adapter.subscribe(callback);

        adapter.enqueue('first payload');

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith('first payload');
    });

    it('should fire multiple subscribers when an item is enqueued', () => {
        const callback1 = jest.fn();
        const callback2 = jest.fn();

        adapter.subscribe(callback1);
        adapter.subscribe(callback2);

        adapter.enqueue('shared payload');

        expect(callback1).toHaveBeenCalledWith('shared payload');
        expect(callback2).toHaveBeenCalledWith('shared payload');
    });
});

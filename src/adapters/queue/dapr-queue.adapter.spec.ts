import { DaprQueueAdapter } from './dapr-queue.adapter';
import { DaprService } from '../../providers/dapr/dapr.service';
import { DaprClient, DaprServer } from '@dapr/dapr';

describe('DaprQueueAdapter', () => {
    let adapter: DaprQueueAdapter<any>;
    let mockDaprService: Partial<DaprService>;
    let mockDaprClient: Partial<DaprClient>;
    let mockDaprServer: Partial<DaprServer>;
    let mockPubsub: any;
    let mockServerPubsub: any;

    beforeEach(() => {
        mockPubsub = {
            publish: jest.fn().mockResolvedValue(true),
        };
        mockServerPubsub = {
            subscribe: jest.fn().mockResolvedValue(true),
        };

        mockDaprClient = {
            pubsub: mockPubsub as any,
        };
        mockDaprServer = {
            pubsub: mockServerPubsub as any,
        };

        mockDaprService = {
            client: mockDaprClient as DaprClient,
            server: mockDaprServer as DaprServer,
        };

        adapter = new DaprQueueAdapter<any>(
            mockDaprService as DaprService,
            'my-pubsub',
            'my-topic'
        );
    });

    it('should be defined', () => {
        expect(adapter).toBeDefined();
    });

    describe('enqueue', () => {
        it('should call daprClient.pubsub.publish with correct arguments', async () => {
            const item = { id: '123', data: 'test' };
            await adapter.enqueue(item);
            expect(mockPubsub.publish).toHaveBeenCalledWith('my-pubsub', 'my-topic', item);
        });
    });

    describe('subscribe', () => {
        it('should register a subscription on the daprServer only once', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();

            adapter.subscribe(callback1);
            adapter.subscribe(callback2);

            expect(mockServerPubsub.subscribe).toHaveBeenCalledTimes(1);
            expect(mockServerPubsub.subscribe).toHaveBeenCalledWith(
                'my-pubsub',
                'my-topic',
                expect.any(Function)
            );
        });

        it('should execute all callbacks when the server subscription handler receives a message', async () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();

            adapter.subscribe(callback1);
            adapter.subscribe(callback2);

            // Extract the registered handler function
            const registeredHandler = mockServerPubsub.subscribe.mock.calls[0][2];

            const messageData = { id: 'msg1' };
            await registeredHandler(messageData);

            expect(callback1).toHaveBeenCalledWith(messageData);
            expect(callback2).toHaveBeenCalledWith(messageData);
        });
    });
});

import { DeliverAudioErrorUseCase } from './deliver-audio-error.use-case';
import { AudioErrorQueuePort } from '../ports/audio-error-queue.port';
import { AudioErrorDeliveryPort } from '../ports/audio-error-delivery.port';
import { LoggerPort } from '../ports/logger.port';
import { AudioProcessingError } from '../domain/audio-processing-error.entity';

describe('DeliverAudioErrorUseCase (Observer Pattern)', () => {
    let useCase: DeliverAudioErrorUseCase;
    let fakeErrorQueuePort: AudioErrorQueuePort;
    let fakeDeliveryPort: AudioErrorDeliveryPort;
    let fakeLogger: LoggerPort;
    let onModuleInitCallback: (error: AudioProcessingError) => void;

    beforeEach(() => {
        fakeErrorQueuePort = {
            enqueue: jest.fn(),
            subscribe: jest.fn().mockImplementation((cb) => {
                onModuleInitCallback = cb;
            }),
        };
        fakeDeliveryPort = {
            deliver: jest.fn(),
        };
        fakeLogger = {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
        };
        useCase = new DeliverAudioErrorUseCase(fakeErrorQueuePort, fakeDeliveryPort, fakeLogger);
    });

    it('should subscribe to the queue on module init', () => {
        useCase.onModuleInit();
        expect(fakeErrorQueuePort.subscribe).toHaveBeenCalledTimes(1);
        expect(onModuleInitCallback).toBeDefined();
    });

    it('should log when subscribing to the queue', () => {
        useCase.onModuleInit();

        expect(fakeLogger.log).toHaveBeenCalledWith(
            'DeliverAudioErrorUseCase',
            expect.stringContaining('Subscribed'),
        );
    });

    it('should deliver the error when the queue emits an item', () => {
        useCase.onModuleInit();
        const error = new AudioProcessingError('audio-123', 'failure reason');

        // Simulate the queue emitting an item
        onModuleInitCallback(error);

        expect(fakeDeliveryPort.deliver).toHaveBeenCalledTimes(1);
        expect(fakeDeliveryPort.deliver).toHaveBeenCalledWith(error);
    });

    it('should log when delivering an audio error', () => {
        useCase.onModuleInit();
        const error = new AudioProcessingError('audio-123', 'failure reason');

        onModuleInitCallback(error);

        expect(fakeLogger.log).toHaveBeenCalledWith(
            'DeliverAudioErrorUseCase',
            expect.stringContaining('Delivering audio error'),
        );
    });
});

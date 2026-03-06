import { DeliverProcessedAudioUseCase } from './deliver-processed-audio.use-case';
import { ProcessedAudioQueuePort } from '../ports/processed-audio-queue.port';
import { ProcessedAudioDeliveryPort } from '../ports/processed-audio-delivery.port';
import { LoggerPort } from '../../../../_shared/core/ports/logger.port';
import { ProcessedAudio } from '../../../audio-processing/core/domain/processed-audio.entity';
import { Transcription, TranscriptionSegment } from '../../../audio-processing/core/domain/transcription.entity';

describe('DeliverProcessedAudioUseCase (Observer Pattern)', () => {
    let useCase: DeliverProcessedAudioUseCase;
    let fakeQueuePort: ProcessedAudioQueuePort;
    let fakeDeliveryPort: ProcessedAudioDeliveryPort;
    let fakeLogger: LoggerPort;
    let onModuleInitCallback: (audio: ProcessedAudio) => void;

    beforeEach(() => {
        fakeQueuePort = {
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
        useCase = new DeliverProcessedAudioUseCase(fakeQueuePort, fakeDeliveryPort, fakeLogger);
    });

    it('should subscribe to the queue on module init', () => {
        useCase.onModuleInit();
        expect(fakeQueuePort.subscribe).toHaveBeenCalledTimes(1);
        expect(onModuleInitCallback).toBeDefined();
    });

    it('should log when subscribing to the queue', () => {
        useCase.onModuleInit();

        expect(fakeLogger.log).toHaveBeenCalledWith(
            'DeliverProcessedAudioUseCase',
            expect.stringContaining('Subscribed'),
        );
    });

    it('should deliver the processed audio when the queue emits an item', () => {
        useCase.onModuleInit();

        const transcription = new Transcription('audio-123', [new TranscriptionSegment(0, 10, 'text')], 'text');
        const processedAudio = new ProcessedAudio('audio-123', transcription, 'summary');

        // Simulate the queue emitting an item
        onModuleInitCallback(processedAudio);

        expect(fakeDeliveryPort.deliver).toHaveBeenCalledTimes(1);
        expect(fakeDeliveryPort.deliver).toHaveBeenCalledWith(processedAudio);
    });

    it('should log when delivering processed audio', () => {
        useCase.onModuleInit();

        const transcription = new Transcription('audio-123', [new TranscriptionSegment(0, 10, 'text')], 'text');
        const processedAudio = new ProcessedAudio('audio-123', transcription, 'summary');

        onModuleInitCallback(processedAudio);

        expect(fakeLogger.log).toHaveBeenCalledWith(
            'DeliverProcessedAudioUseCase',
            expect.stringContaining('Delivering processed audio'),
        );
    });
});

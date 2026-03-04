import { DeliverProcessedAudioUseCase } from './deliver-processed-audio.use-case';
import { ProcessedAudioQueuePort } from '../ports/processed-audio-queue.port';
import { ProcessedAudioDeliveryPort } from '../ports/processed-audio-delivery.port';
import { ProcessedAudio } from '../domain/processed-audio.entity';
import { Transcription, TranscriptionSegment } from '../domain/transcription.entity';

describe('DeliverProcessedAudioUseCase', () => {
    let useCase: DeliverProcessedAudioUseCase;
    let fakeQueuePort: ProcessedAudioQueuePort;
    let fakeDeliveryPort: ProcessedAudioDeliveryPort;

    beforeEach(() => {
        fakeQueuePort = {
            enqueue: jest.fn(),
            dequeue: jest.fn(),
        };
        fakeDeliveryPort = {
            deliver: jest.fn(),
        };
        useCase = new DeliverProcessedAudioUseCase(fakeQueuePort, fakeDeliveryPort);
    });

    it('should dequeue an item and deliver it if available', () => {
        const transcription = new Transcription('audio-123', [new TranscriptionSegment(0, 10, 'text')], 'text');
        const processedAudio = new ProcessedAudio('audio-123', transcription, 'summary');

        (fakeQueuePort.dequeue as jest.Mock).mockReturnValue(processedAudio);

        useCase.execute();

        expect(fakeQueuePort.dequeue).toHaveBeenCalledTimes(1);
        expect(fakeDeliveryPort.deliver).toHaveBeenCalledTimes(1);
        expect(fakeDeliveryPort.deliver).toHaveBeenCalledWith(processedAudio);
    });

    it('should do nothing if queue is empty', () => {
        (fakeQueuePort.dequeue as jest.Mock).mockReturnValue(null);

        useCase.execute();

        expect(fakeQueuePort.dequeue).toHaveBeenCalledTimes(1);
        expect(fakeDeliveryPort.deliver).not.toHaveBeenCalled();
    });
});

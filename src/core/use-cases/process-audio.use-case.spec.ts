import { ProcessAudioUseCase } from './process-audio.use-case';
import { WhatsappAudio } from '../domain/whatsapp-audio.entity';
import { Transcription, TranscriptionSegment } from '../domain/transcription.entity';
import { ProcessedAudio } from '../domain/processed-audio.entity';
import { AudioProcessingError } from '../domain/audio-processing-error.entity';
import { TranscriptionPort } from '../ports/transcription.port';
import { AudioSummaryPort } from '../ports/audio-summary.port';
import { ProcessedAudioQueuePort } from '../ports/processed-audio-queue.port';
import { AudioErrorQueuePort } from '../ports/audio-error-queue.port';
import { AudioProcessingQueuePort } from '../ports/audio-processing-queue.port';

describe('ProcessAudioUseCase', () => {
    let useCase: ProcessAudioUseCase;
    let fakeTranscriptionPort: TranscriptionPort;
    let fakeSummaryPort: AudioSummaryPort;
    let fakeProcessedQueue: ProcessedAudioQueuePort;
    let fakeErrorQueue: AudioErrorQueuePort;

    let fakeProcessingQueue: AudioProcessingQueuePort;

    beforeEach(() => {
        fakeTranscriptionPort = {
            transcribe: jest.fn(),
        };
        fakeSummaryPort = {
            summarize: jest.fn(),
        };
        fakeProcessedQueue = {
            enqueue: jest.fn(),
            dequeue: jest.fn(),
        };
        fakeErrorQueue = {
            enqueue: jest.fn(),
            dequeue: jest.fn(),
        };
        fakeProcessingQueue = {
            enqueue: jest.fn(),
            dequeue: jest.fn(),
        };
        useCase = new ProcessAudioUseCase(
            fakeTranscriptionPort,
            fakeSummaryPort,
            fakeProcessedQueue,
            fakeErrorQueue,
            fakeProcessingQueue,
        );
    });

    it('should process audio successfully and enqueue the result', async () => {
        const audio = new WhatsappAudio('audio-123', 'content', 'sender', 'sender');
        const transcription = new Transcription('audio-123', [new TranscriptionSegment(0, 10, 'hello')], 'hello');

        (fakeProcessingQueue.dequeue as jest.Mock).mockReturnValue(audio);
        (fakeTranscriptionPort.transcribe as jest.Mock).mockResolvedValue(transcription);
        (fakeSummaryPort.summarize as jest.Mock).mockResolvedValue('summary text');

        await useCase.execute();

        expect(fakeProcessingQueue.dequeue).toHaveBeenCalledTimes(1);
        expect(fakeTranscriptionPort.transcribe).toHaveBeenCalledWith('audio-123', 'content');
        expect(fakeSummaryPort.summarize).toHaveBeenCalledWith(transcription);

        expect(fakeProcessedQueue.enqueue).toHaveBeenCalledTimes(1);
        const processedAudio = (fakeProcessedQueue.enqueue as jest.Mock).mock.calls[0][0] as ProcessedAudio;
        expect(processedAudio.whatsappAudioId).toBe('audio-123');
        expect(processedAudio.transcription).toBe(transcription);
        expect(processedAudio.summary).toBe('summary text');

        expect(fakeErrorQueue.enqueue).not.toHaveBeenCalled();
    });

    it('should enqueue an error if transcription fails', async () => {
        const audio = new WhatsappAudio('audio-123', 'content', 'sender', 'sender');
        const error = new Error('Transcription failed');

        (fakeProcessingQueue.dequeue as jest.Mock).mockReturnValue(audio);
        (fakeTranscriptionPort.transcribe as jest.Mock).mockRejectedValue(error);

        await useCase.execute();

        expect(fakeProcessingQueue.dequeue).toHaveBeenCalledTimes(1);
        expect(fakeErrorQueue.enqueue).toHaveBeenCalledTimes(1);
        const processingError = (fakeErrorQueue.enqueue as jest.Mock).mock.calls[0][0] as AudioProcessingError;
        expect(processingError.whatsappAudioId).toBe('audio-123');
        expect(processingError.reason).toContain('Transcription failed');
        expect(fakeProcessedQueue.enqueue).not.toHaveBeenCalled();
    });

    it('should enqueue an error if summarization fails', async () => {
        const audio = new WhatsappAudio('audio-123', 'content', 'sender', 'sender');
        const transcription = new Transcription('audio-123', [new TranscriptionSegment(0, 10, 'hello')], 'hello');

        (fakeProcessingQueue.dequeue as jest.Mock).mockReturnValue(audio);
        (fakeTranscriptionPort.transcribe as jest.Mock).mockResolvedValue(transcription);
        const error = new Error('Summarization failed');
        (fakeSummaryPort.summarize as jest.Mock).mockRejectedValue(error);

        await useCase.execute();

        expect(fakeProcessingQueue.dequeue).toHaveBeenCalledTimes(1);
        expect(fakeErrorQueue.enqueue).toHaveBeenCalledTimes(1);
        const processingError = (fakeErrorQueue.enqueue as jest.Mock).mock.calls[0][0] as AudioProcessingError;
        expect(processingError.whatsappAudioId).toBe('audio-123');
        expect(processingError.reason).toContain('Summarization failed');
        expect(fakeProcessedQueue.enqueue).not.toHaveBeenCalled();
    });

    it('should do nothing if processing queue is empty', async () => {
        (fakeProcessingQueue.dequeue as jest.Mock).mockReturnValue(null);

        await useCase.execute();

        expect(fakeProcessingQueue.dequeue).toHaveBeenCalledTimes(1);
        expect(fakeTranscriptionPort.transcribe).not.toHaveBeenCalled();
        expect(fakeProcessedQueue.enqueue).not.toHaveBeenCalled();
        expect(fakeErrorQueue.enqueue).not.toHaveBeenCalled();
    });
});

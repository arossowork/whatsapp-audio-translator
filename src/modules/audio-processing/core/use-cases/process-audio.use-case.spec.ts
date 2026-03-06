import { ProcessAudioUseCase } from './process-audio.use-case';
import { WhatsappAudio } from '../../../messaging/core/domain/whatsapp-audio.entity';
import { Transcription, TranscriptionSegment } from '../domain/transcription.entity';
import { ProcessedAudio } from '../domain/processed-audio.entity';
import { AudioProcessingError } from '../domain/audio-processing-error.entity';
import { TranscriptionPort } from '../ports/transcription.port';
import { AudioSummaryPort } from '../ports/audio-summary.port';
import { ProcessedAudioQueuePort } from '../../../messaging/core/ports/processed-audio-queue.port';
import { AudioErrorQueuePort } from '../../../messaging/core/ports/audio-error-queue.port';
import { AudioProcessingQueuePort } from '../../../messaging/core/ports/audio-processing-queue.port';
import { LoggerPort } from '../../../_shared/core/ports/logger.port';

describe('ProcessAudioUseCase (Observer Pattern)', () => {
    let useCase: ProcessAudioUseCase;
    let fakeTranscriptionPort: TranscriptionPort;
    let fakeSummaryPort: AudioSummaryPort;
    let fakeProcessedQueue: ProcessedAudioQueuePort;
    let fakeErrorQueue: AudioErrorQueuePort;
    let fakeProcessingQueue: AudioProcessingQueuePort;
    let fakeLogger: LoggerPort;

    let onModuleInitCallback: (audio: WhatsappAudio) => Promise<void>;

    beforeEach(() => {
        fakeTranscriptionPort = {
            transcribe: jest.fn(),
        };
        fakeSummaryPort = {
            summarize: jest.fn(),
        };
        fakeProcessedQueue = {
            enqueue: jest.fn(),
            subscribe: jest.fn(),
        };
        fakeErrorQueue = {
            enqueue: jest.fn(),
            subscribe: jest.fn(),
        };
        fakeProcessingQueue = {
            enqueue: jest.fn(),
            subscribe: jest.fn().mockImplementation((cb) => {
                onModuleInitCallback = cb;
            }),
        };
        fakeLogger = {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
        };
        useCase = new ProcessAudioUseCase(
            fakeTranscriptionPort,
            fakeSummaryPort,
            fakeProcessedQueue,
            fakeErrorQueue,
            fakeProcessingQueue,
            fakeLogger,
        );
    });

    it('should subscribe to the queue on module init', () => {
        useCase.onModuleInit();
        expect(fakeProcessingQueue.subscribe).toHaveBeenCalledTimes(1);
        expect(onModuleInitCallback).toBeDefined();
    });

    it('should log when subscribing to the queue', () => {
        useCase.onModuleInit();

        expect(fakeLogger.log).toHaveBeenCalledWith(
            'ProcessAudioUseCase',
            expect.stringContaining('Subscribed'),
        );
    });

    it('should process audio successfully and enqueue the result when item is emitted', async () => {
        useCase.onModuleInit();

        const audio = new WhatsappAudio('audio-123', 'content', 'sender', 'sender');
        const transcription = new Transcription('audio-123', [new TranscriptionSegment(0, 10, 'hello')], 'hello');

        (fakeTranscriptionPort.transcribe as jest.Mock).mockResolvedValue(transcription);
        (fakeSummaryPort.summarize as jest.Mock).mockResolvedValue('summary text');

        await onModuleInitCallback(audio);

        expect(fakeTranscriptionPort.transcribe).toHaveBeenCalledWith('audio-123', 'content');
        expect(fakeSummaryPort.summarize).toHaveBeenCalledWith(transcription);

        expect(fakeProcessedQueue.enqueue).toHaveBeenCalledTimes(1);
        const processedAudio = (fakeProcessedQueue.enqueue as jest.Mock).mock.calls[0][0] as ProcessedAudio;
        expect(processedAudio.whatsappAudioId).toBe('audio-123');
        expect(processedAudio.transcription).toBe(transcription);
        expect(processedAudio.summary).toBe('summary text');

        expect(fakeErrorQueue.enqueue).not.toHaveBeenCalled();
    });

    it('should log at each processing step on success', async () => {
        useCase.onModuleInit();

        const audio = new WhatsappAudio('audio-123', 'content', 'sender', 'sender');
        const transcription = new Transcription('audio-123', [new TranscriptionSegment(0, 10, 'hello')], 'hello');

        (fakeTranscriptionPort.transcribe as jest.Mock).mockResolvedValue(transcription);
        (fakeSummaryPort.summarize as jest.Mock).mockResolvedValue('summary text');

        await onModuleInitCallback(audio);

        expect(fakeLogger.log).toHaveBeenCalledWith(
            'ProcessAudioUseCase',
            expect.stringContaining('Processing started'),
        );
        expect(fakeLogger.log).toHaveBeenCalledWith(
            'ProcessAudioUseCase',
            expect.stringContaining('Transcription completed'),
        );
        expect(fakeLogger.log).toHaveBeenCalledWith(
            'ProcessAudioUseCase',
            expect.stringContaining('Summarization completed'),
        );
        expect(fakeLogger.log).toHaveBeenCalledWith(
            'ProcessAudioUseCase',
            expect.stringContaining('processed successfully'),
        );
    });

    it('should enqueue an error if transcription fails', async () => {
        useCase.onModuleInit();

        const audio = new WhatsappAudio('audio-123', 'content', 'sender', 'sender');
        const error = new Error('Transcription failed');

        (fakeTranscriptionPort.transcribe as jest.Mock).mockRejectedValue(error);

        await onModuleInitCallback(audio);

        expect(fakeErrorQueue.enqueue).toHaveBeenCalledTimes(1);
        const processingError = (fakeErrorQueue.enqueue as jest.Mock).mock.calls[0][0] as AudioProcessingError;
        expect(processingError.whatsappAudioId).toBe('audio-123');
        expect(processingError.reason).toContain('Transcription failed');
        expect(fakeProcessedQueue.enqueue).not.toHaveBeenCalled();
    });

    it('should throw or enqueue an error if audio id is undefined', async () => {
        useCase.onModuleInit();

        const audio = { audioContent: 'content', sender: 'sender', receiver: 'receiver' } as any; // No ID

        await onModuleInitCallback(audio);

        expect(fakeErrorQueue.enqueue).toHaveBeenCalledTimes(1);
        const processingError = (fakeErrorQueue.enqueue as jest.Mock).mock.calls[0][0] as AudioProcessingError;
        expect(processingError.reason).toContain('Audio ID is missing');
        expect(fakeProcessedQueue.enqueue).not.toHaveBeenCalled();
        expect(fakeTranscriptionPort.transcribe).not.toHaveBeenCalled();
    });

    it('should log error when processing fails', async () => {
        useCase.onModuleInit();

        const audio = new WhatsappAudio('audio-123', 'content', 'sender', 'sender');
        (fakeTranscriptionPort.transcribe as jest.Mock).mockRejectedValue(new Error('Transcription failed'));

        await onModuleInitCallback(audio);

        expect(fakeLogger.error).toHaveBeenCalledWith(
            'ProcessAudioUseCase',
            expect.stringContaining('failed'),
            expect.any(String),
        );
    });

    it('should enqueue an error if summarization fails', async () => {
        useCase.onModuleInit();

        const audio = new WhatsappAudio('audio-123', 'content', 'sender', 'sender');
        const transcription = new Transcription('audio-123', [new TranscriptionSegment(0, 10, 'hello')], 'hello');

        (fakeTranscriptionPort.transcribe as jest.Mock).mockResolvedValue(transcription);
        const error = new Error('Summarization failed');
        (fakeSummaryPort.summarize as jest.Mock).mockRejectedValue(error);

        await onModuleInitCallback(audio);

        expect(fakeErrorQueue.enqueue).toHaveBeenCalledTimes(1);
        const processingError = (fakeErrorQueue.enqueue as jest.Mock).mock.calls[0][0] as AudioProcessingError;
        expect(processingError.whatsappAudioId).toBe('audio-123');
        expect(processingError.reason).toContain('Summarization failed');
        expect(fakeProcessedQueue.enqueue).not.toHaveBeenCalled();
    });
});

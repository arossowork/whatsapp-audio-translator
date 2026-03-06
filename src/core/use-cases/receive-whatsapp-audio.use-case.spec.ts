import { AudioProcessingQueuePort } from '../ports/audio-processing-queue.port';
import { LoggerPort } from '../ports/logger.port';
import { WhatsappAudio } from '../domain/whatsapp-audio.entity';
import { ReceiveWhatsappAudioUseCase } from './receive-whatsapp-audio.use-case';

describe('ReceiveWhatsappAudioUseCase', () => {
    let useCase: ReceiveWhatsappAudioUseCase;
    let fakeAudioQueue: AudioProcessingQueuePort;
    let fakeLogger: LoggerPort;

    beforeEach(() => {
        fakeAudioQueue = {
            enqueue: jest.fn(),
            subscribe: jest.fn(),
        };
        fakeLogger = {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
        };
        useCase = new ReceiveWhatsappAudioUseCase(fakeAudioQueue, fakeLogger);
    });

    it('should enqueue the audio if sender and receiver are the same', () => {
        const audio = new WhatsappAudio('1', 'audio-data', '1234567890', '1234567890');

        useCase.execute(audio);

        expect(fakeAudioQueue.enqueue).toHaveBeenCalledTimes(1);
        expect(fakeAudioQueue.enqueue).toHaveBeenCalledWith(audio);
    });

    it('should NOT enqueue the audio if sender and receiver are different', () => {
        const audio = new WhatsappAudio('1', 'audio-data', 'sender-1', 'receiver-2');

        useCase.execute(audio);

        expect(fakeAudioQueue.enqueue).not.toHaveBeenCalled();
    });

    it('should log when audio is received', () => {
        const audio = new WhatsappAudio('msg-1', 'audio-data', '1234567890', '1234567890');

        useCase.execute(audio);

        expect(fakeLogger.log).toHaveBeenCalledWith(
            'ReceiveWhatsappAudioUseCase',
            expect.stringContaining('Audio received'),
        );
    });

    it('should log when audio is enqueued for processing', () => {
        const audio = new WhatsappAudio('msg-1', 'audio-data', '1234567890', '1234567890');

        useCase.execute(audio);

        expect(fakeLogger.log).toHaveBeenCalledWith(
            'ReceiveWhatsappAudioUseCase',
            expect.stringContaining('enqueued'),
        );
    });

    it('should log when audio is filtered out (sender ≠ receiver)', () => {
        const audio = new WhatsappAudio('msg-1', 'audio-data', 'sender-1', 'receiver-2');

        useCase.execute(audio);

        expect(fakeLogger.debug).toHaveBeenCalledWith(
            'ReceiveWhatsappAudioUseCase',
            expect.stringContaining('ignored'),
        );
    });
});

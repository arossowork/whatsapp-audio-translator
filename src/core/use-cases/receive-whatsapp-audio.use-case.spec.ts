import { AudioProcessingQueuePort } from '../ports/audio-processing-queue.port';
import { WhatsappAudio } from '../domain/whatsapp-audio.entity';
import { ReceiveWhatsappAudioUseCase } from './receive-whatsapp-audio.use-case';

describe('ReceiveWhatsappAudioUseCase', () => {
    let useCase: ReceiveWhatsappAudioUseCase;
    let fakeAudioQueue: AudioProcessingQueuePort;

    beforeEach(() => {
        fakeAudioQueue = {
            enqueue: jest.fn(),
        };
        useCase = new ReceiveWhatsappAudioUseCase(fakeAudioQueue);
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
});

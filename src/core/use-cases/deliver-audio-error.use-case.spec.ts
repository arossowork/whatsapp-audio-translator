import { DeliverAudioErrorUseCase } from './deliver-audio-error.use-case';
import { AudioErrorQueuePort } from '../ports/audio-error-queue.port';
import { AudioErrorDeliveryPort } from '../ports/audio-error-delivery.port';
import { AudioProcessingError } from '../domain/audio-processing-error.entity';

describe('DeliverAudioErrorUseCase', () => {
    let useCase: DeliverAudioErrorUseCase;
    let fakeErrorQueuePort: AudioErrorQueuePort;
    let fakeDeliveryPort: AudioErrorDeliveryPort;

    beforeEach(() => {
        fakeErrorQueuePort = {
            enqueue: jest.fn(),
            dequeue: jest.fn(),
        };
        fakeDeliveryPort = {
            deliver: jest.fn(),
        };
        useCase = new DeliverAudioErrorUseCase(fakeErrorQueuePort, fakeDeliveryPort);
    });

    it('should dequeue an error and deliver it if available', () => {
        const error = new AudioProcessingError('audio-123', 'failure reason');

        (fakeErrorQueuePort.dequeue as jest.Mock).mockReturnValue(error);

        useCase.execute();

        expect(fakeErrorQueuePort.dequeue).toHaveBeenCalledTimes(1);
        expect(fakeDeliveryPort.deliver).toHaveBeenCalledTimes(1);
        expect(fakeDeliveryPort.deliver).toHaveBeenCalledWith(error);
    });

    it('should do nothing if queue is empty', () => {
        (fakeErrorQueuePort.dequeue as jest.Mock).mockReturnValue(null);

        useCase.execute();

        expect(fakeErrorQueuePort.dequeue).toHaveBeenCalledTimes(1);
        expect(fakeDeliveryPort.deliver).not.toHaveBeenCalled();
    });
});

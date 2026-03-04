import { Injectable, Inject } from '@nestjs/common';
import { AudioErrorQueuePort } from '../ports/audio-error-queue.port';
import { AudioErrorDeliveryPort } from '../ports/audio-error-delivery.port';
import { AUDIO_ERROR_QUEUE_PORT, AUDIO_ERROR_DELIVERY_PORT } from '../ports/tokens';

@Injectable()
export class DeliverAudioErrorUseCase {
    constructor(
        @Inject(AUDIO_ERROR_QUEUE_PORT) private readonly errorQueue: AudioErrorQueuePort,
        @Inject(AUDIO_ERROR_DELIVERY_PORT) private readonly deliveryPort: AudioErrorDeliveryPort,
    ) { }

    execute(): void {
        const error = this.errorQueue.dequeue();
        if (error) {
            this.deliveryPort.deliver(error);
        }
    }
}

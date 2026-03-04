import { Injectable, Inject } from '@nestjs/common';
import { ProcessedAudioQueuePort } from '../ports/processed-audio-queue.port';
import { ProcessedAudioDeliveryPort } from '../ports/processed-audio-delivery.port';
import { PROCESSED_AUDIO_QUEUE_PORT, PROCESSED_AUDIO_DELIVERY_PORT } from '../ports/tokens';

@Injectable()
export class DeliverProcessedAudioUseCase {
    constructor(
        @Inject(PROCESSED_AUDIO_QUEUE_PORT) private readonly processedQueue: ProcessedAudioQueuePort,
        @Inject(PROCESSED_AUDIO_DELIVERY_PORT) private readonly deliveryPort: ProcessedAudioDeliveryPort,
    ) { }

    execute(): void {
        const processedAudio = this.processedQueue.dequeue();
        if (processedAudio) {
            this.deliveryPort.deliver(processedAudio);
        }
    }
}

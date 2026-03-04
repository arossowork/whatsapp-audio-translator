import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import type { AudioErrorQueuePort } from '../ports/audio-error-queue.port';
import type { AudioErrorDeliveryPort } from '../ports/audio-error-delivery.port';
import { AUDIO_ERROR_QUEUE_PORT, AUDIO_ERROR_DELIVERY_PORT } from '../ports/tokens';
import { AudioProcessingError } from '../domain/audio-processing-error.entity';

@Injectable()
export class DeliverAudioErrorUseCase implements OnModuleInit {
    constructor(
        @Inject(AUDIO_ERROR_QUEUE_PORT) private readonly errorQueue: AudioErrorQueuePort,
        @Inject(AUDIO_ERROR_DELIVERY_PORT) private readonly deliveryPort: AudioErrorDeliveryPort,
    ) { }

    onModuleInit(): void {
        this.errorQueue.subscribe(this.handleError.bind(this));
    }

    private handleError(error: AudioProcessingError): void {
        this.deliveryPort.deliver(error);
    }
}

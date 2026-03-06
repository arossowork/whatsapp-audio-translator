import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import type { AudioErrorQueuePort } from '../ports/audio-error-queue.port';
import type { AudioErrorDeliveryPort } from '../ports/audio-error-delivery.port';
import type { LoggerPort } from '../../../_shared/core/ports/logger.port';
import { AUDIO_ERROR_QUEUE_PORT, AUDIO_ERROR_DELIVERY_PORT, LOGGER_PORT } from '../../../_shared/core/ports/tokens';
import { AudioProcessingError } from '../../../audio-processing/core/domain/audio-processing-error.entity';

@Injectable()
export class DeliverAudioErrorUseCase implements OnModuleInit {
    constructor(
        @Inject(AUDIO_ERROR_QUEUE_PORT) private readonly errorQueue: AudioErrorQueuePort,
        @Inject(AUDIO_ERROR_DELIVERY_PORT) private readonly deliveryPort: AudioErrorDeliveryPort,
        @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    ) { }

    onModuleInit(): void {
        this.errorQueue.subscribe(this.handleError.bind(this));
        this.logger.log('DeliverAudioErrorUseCase', 'Subscribed to audio error queue');
    }

    private handleError(error: AudioProcessingError): void {
        this.logger.log('DeliverAudioErrorUseCase', `Delivering audio error for audioId=${error.whatsappAudioId}: ${error.reason}`);
        this.deliveryPort.deliver(error);
    }
}

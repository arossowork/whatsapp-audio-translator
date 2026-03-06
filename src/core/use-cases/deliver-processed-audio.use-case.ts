import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import type { ProcessedAudioQueuePort } from '../ports/processed-audio-queue.port';
import type { ProcessedAudioDeliveryPort } from '../ports/processed-audio-delivery.port';
import type { LoggerPort } from '../ports/logger.port';
import { PROCESSED_AUDIO_QUEUE_PORT, PROCESSED_AUDIO_DELIVERY_PORT, LOGGER_PORT } from '../ports/tokens';
import { ProcessedAudio } from '../domain/processed-audio.entity';

@Injectable()
export class DeliverProcessedAudioUseCase implements OnModuleInit {
    constructor(
        @Inject(PROCESSED_AUDIO_QUEUE_PORT) private readonly processedQueue: ProcessedAudioQueuePort,
        @Inject(PROCESSED_AUDIO_DELIVERY_PORT) private readonly deliveryPort: ProcessedAudioDeliveryPort,
        @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    ) { }

    onModuleInit(): void {
        this.processedQueue.subscribe(this.handleProcessedAudio.bind(this));
        this.logger.log('DeliverProcessedAudioUseCase', 'Subscribed to processed audio queue');
    }

    private handleProcessedAudio(processedAudio: ProcessedAudio): void {
        this.logger.log('DeliverProcessedAudioUseCase', `Delivering processed audio for audioId=${processedAudio.whatsappAudioId}`);
        this.deliveryPort.deliver(processedAudio);
    }
}

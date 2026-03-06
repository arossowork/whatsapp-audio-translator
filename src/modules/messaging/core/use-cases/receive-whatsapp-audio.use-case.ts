import { Injectable, Inject } from '@nestjs/common';
import { WhatsappAudio } from '../domain/whatsapp-audio.entity';
import type { AudioProcessingQueuePort } from '../ports/audio-processing-queue.port';
import type { LoggerPort } from '../../../_shared/core/ports/logger.port';
import { AUDIO_PROCESSING_QUEUE_PORT, LOGGER_PORT } from '../../../_shared/core/ports/tokens';

@Injectable()
export class ReceiveWhatsappAudioUseCase {
    constructor(
        @Inject(AUDIO_PROCESSING_QUEUE_PORT)
        private readonly audioQueue: AudioProcessingQueuePort,
        @Inject(LOGGER_PORT)
        private readonly logger: LoggerPort,
    ) { }

    execute(audio: WhatsappAudio): void {
        this.logger.log('ReceiveWhatsappAudioUseCase', `Audio received from sender=${audio.sender}`);

        if (audio.sender === audio.receiver) {
            this.audioQueue.enqueue(audio);
            this.logger.log('ReceiveWhatsappAudioUseCase', `Audio enqueued for processing`);
        } else {
            this.logger.debug('ReceiveWhatsappAudioUseCase', `Audio ignored — sender and receiver differ`);
        }
    }
}

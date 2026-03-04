import { Injectable, Inject } from '@nestjs/common';
import { WhatsappAudio } from '../domain/whatsapp-audio.entity';
import type { AudioProcessingQueuePort } from '../ports/audio-processing-queue.port';
import { AUDIO_PROCESSING_QUEUE_PORT } from '../ports/tokens';

@Injectable()
export class ReceiveWhatsappAudioUseCase {
    constructor(
        @Inject(AUDIO_PROCESSING_QUEUE_PORT)
        private readonly audioQueue: AudioProcessingQueuePort,
    ) { }

    execute(audio: WhatsappAudio): void {
        if (audio.sender === audio.receiver) {
            this.audioQueue.enqueue(audio);
        }
    }
}

import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { WhatsappAudio } from '../domain/whatsapp-audio.entity';
import { ProcessedAudio } from '../domain/processed-audio.entity';
import { AudioProcessingError } from '../domain/audio-processing-error.entity';
import type { TranscriptionPort } from '../ports/transcription.port';
import type { AudioSummaryPort } from '../ports/audio-summary.port';
import type { ProcessedAudioQueuePort } from '../ports/processed-audio-queue.port';
import type { AudioErrorQueuePort } from '../ports/audio-error-queue.port';
import type { AudioProcessingQueuePort } from '../ports/audio-processing-queue.port';
import {
    TRANSCRIPTION_PORT,
    AUDIO_SUMMARY_PORT,
    PROCESSED_AUDIO_QUEUE_PORT,
    AUDIO_ERROR_QUEUE_PORT,
    AUDIO_PROCESSING_QUEUE_PORT,
} from '../ports/tokens';

@Injectable()
export class ProcessAudioUseCase implements OnModuleInit {
    constructor(
        @Inject(TRANSCRIPTION_PORT) private readonly transcriptionPort: TranscriptionPort,
        @Inject(AUDIO_SUMMARY_PORT) private readonly summaryPort: AudioSummaryPort,
        @Inject(PROCESSED_AUDIO_QUEUE_PORT) private readonly processedQueue: ProcessedAudioQueuePort,
        @Inject(AUDIO_ERROR_QUEUE_PORT) private readonly errorQueue: AudioErrorQueuePort,
        @Inject(AUDIO_PROCESSING_QUEUE_PORT) private readonly processingQueue: AudioProcessingQueuePort,
    ) { }

    onModuleInit(): void {
        this.processingQueue.subscribe(this.handleAudio.bind(this));
    }

    private async handleAudio(audio: WhatsappAudio): Promise<void> {
        try {
            const transcription = await this.transcriptionPort.transcribe(audio.id, audio.audioContent);
            const summary = await this.summaryPort.summarize(transcription);

            const processedAudio = new ProcessedAudio(audio.id, transcription, summary);
            this.processedQueue.enqueue(processedAudio);
        } catch (e: any) {
            const error = new AudioProcessingError(audio.id, e.message || 'Unknown processing error');
            this.errorQueue.enqueue(error);
        }
    }
}

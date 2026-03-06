import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { WhatsappAudio } from '../domain/whatsapp-audio.entity';
import { ProcessedAudio } from '../domain/processed-audio.entity';
import { AudioProcessingError } from '../domain/audio-processing-error.entity';
import type { TranscriptionPort } from '../ports/transcription.port';
import type { AudioSummaryPort } from '../ports/audio-summary.port';
import type { ProcessedAudioQueuePort } from '../ports/processed-audio-queue.port';
import type { AudioErrorQueuePort } from '../ports/audio-error-queue.port';
import type { AudioProcessingQueuePort } from '../ports/audio-processing-queue.port';
import type { LoggerPort } from '../ports/logger.port';
import {
    TRANSCRIPTION_PORT,
    AUDIO_SUMMARY_PORT,
    PROCESSED_AUDIO_QUEUE_PORT,
    AUDIO_ERROR_QUEUE_PORT,
    AUDIO_PROCESSING_QUEUE_PORT,
    LOGGER_PORT,
} from '../ports/tokens';

@Injectable()
export class ProcessAudioUseCase implements OnModuleInit {
    constructor(
        @Inject(TRANSCRIPTION_PORT) private readonly transcriptionPort: TranscriptionPort,
        @Inject(AUDIO_SUMMARY_PORT) private readonly summaryPort: AudioSummaryPort,
        @Inject(PROCESSED_AUDIO_QUEUE_PORT) private readonly processedQueue: ProcessedAudioQueuePort,
        @Inject(AUDIO_ERROR_QUEUE_PORT) private readonly errorQueue: AudioErrorQueuePort,
        @Inject(AUDIO_PROCESSING_QUEUE_PORT) private readonly processingQueue: AudioProcessingQueuePort,
        @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    ) { }

    onModuleInit(): void {
        this.processingQueue.subscribe(this.handleAudio.bind(this));
        this.logger.log('ProcessAudioUseCase', 'Subscribed to audio processing queue');
    }

    private async handleAudio(audio: WhatsappAudio): Promise<void> {
        this.logger.log('ProcessAudioUseCase', `Processing started for audioId=${audio.id}`);

        try {
            const transcription = await this.transcriptionPort.transcribe(audio.id, audio.audioContent);
            this.logger.log('ProcessAudioUseCase', `Transcription completed for audioId=${audio.id}`);

            const summary = await this.summaryPort.summarize(transcription);
            this.logger.log('ProcessAudioUseCase', `Summarization completed for audioId=${audio.id}`);

            const processedAudio = new ProcessedAudio(audio.id, transcription, summary);
            this.processedQueue.enqueue(processedAudio);
            this.logger.log('ProcessAudioUseCase', `Audio processed successfully — result enqueued for audioId=${audio.id}`);
        } catch (e: any) {
            const errorMessage = e.message || 'Unknown processing error';
            this.logger.error('ProcessAudioUseCase', `Audio processing failed for audioId=${audio.id}: ${errorMessage}`, e.stack);
            const error = new AudioProcessingError(audio.id, errorMessage);
            this.errorQueue.enqueue(error);
        }
    }
}

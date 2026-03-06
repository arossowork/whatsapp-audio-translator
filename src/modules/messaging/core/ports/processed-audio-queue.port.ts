import { ProcessedAudio } from '../../../audio-processing/core/domain/processed-audio.entity';

export interface ProcessedAudioQueuePort {
    enqueue(processedAudio: ProcessedAudio): void;
    subscribe(callback: (processedAudio: ProcessedAudio) => void): void;
}

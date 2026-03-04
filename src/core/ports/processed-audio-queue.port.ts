import { ProcessedAudio } from '../domain/processed-audio.entity';

export interface ProcessedAudioQueuePort {
    enqueue(processedAudio: ProcessedAudio): void;
    dequeue(): ProcessedAudio | null;
}

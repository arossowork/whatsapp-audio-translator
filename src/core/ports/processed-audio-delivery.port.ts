import { ProcessedAudio } from '../domain/processed-audio.entity';

export interface ProcessedAudioDeliveryPort {
    deliver(processedAudio: ProcessedAudio): void;
}

import { ProcessedAudio } from '../../../audio-processing/core/domain/processed-audio.entity';

export interface ProcessedAudioDeliveryPort {
    deliver(processedAudio: ProcessedAudio): void;
}

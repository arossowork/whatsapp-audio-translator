import { AudioProcessingError } from '../../../audio-processing/core/domain/audio-processing-error.entity';

export interface AudioErrorQueuePort {
    enqueue(error: AudioProcessingError): void;
    subscribe(callback: (error: AudioProcessingError) => void): void;
}

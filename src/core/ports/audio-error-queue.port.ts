import { AudioProcessingError } from '../domain/audio-processing-error.entity';

export interface AudioErrorQueuePort {
    enqueue(error: AudioProcessingError): void;
    dequeue(): AudioProcessingError | null;
}

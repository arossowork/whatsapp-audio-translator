import { AudioProcessingError } from '../domain/audio-processing-error.entity';

export interface AudioErrorDeliveryPort {
    deliver(error: AudioProcessingError): void;
}

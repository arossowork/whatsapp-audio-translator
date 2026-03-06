import { AudioProcessingError } from '../../../audio-processing/core/domain/audio-processing-error.entity';

export interface AudioErrorDeliveryPort {
    deliver(error: AudioProcessingError): void;
}

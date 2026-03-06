import { Transcription } from '../../core/domain/transcription.entity';

export interface TranscriptionPort {
    transcribe(whatsappAudioId: string, audioContent: string): Promise<Transcription>;
}

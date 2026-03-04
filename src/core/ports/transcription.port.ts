import { Transcription } from '../domain/transcription.entity';

export interface TranscriptionPort {
    transcribe(whatsappAudioId: string, audioContent: string): Promise<Transcription>;
}

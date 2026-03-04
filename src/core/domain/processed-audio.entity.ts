import { Transcription } from './transcription.entity';

export class ProcessedAudio {
    constructor(
        public readonly whatsappAudioId: string,
        public readonly transcription: Omit<Transcription, 'whatsappAudioId'>,
        public readonly summary: string,
    ) { }
}

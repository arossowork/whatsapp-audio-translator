export class AudioProcessingError {
    constructor(
        public readonly whatsappAudioId: string,
        public readonly reason: string,
    ) { }
}

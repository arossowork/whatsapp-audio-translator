export class TranscriptionSegment {
    constructor(
        public readonly startTimestamp: number,
        public readonly endTimestamp: number,
        public readonly text: string,
    ) { }
}

export class Transcription {
    constructor(
        public readonly whatsappAudioId: string,
        public readonly segments: TranscriptionSegment[],
        public readonly fullText: string,
    ) { }
}

export class WhatsappAudio {
    constructor(
        public readonly id: string,
        public readonly audioContent: string,
        public readonly sender: string,
        public readonly receiver: string,
        public readonly createdAt: Date = new Date(),
    ) { }
}

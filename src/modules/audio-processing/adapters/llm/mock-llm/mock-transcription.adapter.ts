import { Injectable, Logger } from '@nestjs/common';
import { TranscriptionPort } from '../../../core/ports/transcription.port';
import { Transcription } from '../../../core/domain/transcription.entity';

@Injectable()
export class MockTranscriptionAdapter implements TranscriptionPort {
    private readonly logger = new Logger(MockTranscriptionAdapter.name);

    async transcribe(whatsappAudioId: string, audioContent: string): Promise<Transcription> {
        this.logger.debug(`[audioId=${whatsappAudioId}] Simulating transcription — input size=${audioContent.length} chars`);

        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const transcription = new Transcription(
            whatsappAudioId,
            [
                { startTimestamp: 0, endTimestamp: 1000, text: 'Hello, this is a mock transcription.' },
                { startTimestamp: 1000, endTimestamp: 2000, text: 'It works perfectly!' }
            ],
            'Hello, this is a mock transcription. It works perfectly!'
        );

        this.logger.debug(`[audioId=${whatsappAudioId}] Transcription complete — ${transcription.segments.length} segments`);
        return transcription;
    }
}

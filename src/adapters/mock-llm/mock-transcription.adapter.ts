import { Injectable, Logger } from '@nestjs/common';
import { TranscriptionPort } from '../../core/ports/transcription.port';
import { Transcription } from '../../core/domain/transcription.entity';

@Injectable()
export class MockTranscriptionAdapter implements TranscriptionPort {
    private readonly logger = new Logger(MockTranscriptionAdapter.name);

    async transcribe(whatsappAudioId: string, audioContent: string): Promise<Transcription> {
        this.logger.debug(`Simulating transcription for audio ID: ${whatsappAudioId}`);

        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Return a dummy transcription
        return new Transcription(
            whatsappAudioId,
            [
                { startTimestamp: 0, endTimestamp: 1000, text: 'Hello, this is a mock transcription.' },
                { startTimestamp: 1000, endTimestamp: 2000, text: 'It works perfectly!' }
            ],
            'Hello, this is a mock transcription. It works perfectly!'
        );
    }
}

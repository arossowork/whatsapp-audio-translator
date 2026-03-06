import { Injectable, Logger } from '@nestjs/common';
import { AudioSummaryPort } from '../../../core/ports/audio-summary.port';
import { Transcription } from '../../../core/domain/transcription.entity';

@Injectable()
export class MockAudioSummaryAdapter implements AudioSummaryPort {
    private readonly logger = new Logger(MockAudioSummaryAdapter.name);

    async summarize(transcription: Transcription): Promise<string> {
        this.logger.debug(`[audioId=${transcription.whatsappAudioId}] Simulating summary generation — ${transcription.segments.length} segments, ${transcription.fullText.length} chars`);

        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const summary = `[MOCK SUMMARY] The user sent an audio message containing ${transcription.segments.length} segments. The main point discussed was: "${transcription.fullText.substring(0, 30)}..."`;

        this.logger.debug(`[audioId=${transcription.whatsappAudioId}] Summary generation complete`);
        return summary;
    }
}

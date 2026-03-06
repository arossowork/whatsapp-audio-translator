import { Module } from '@nestjs/common';
import { MockTranscriptionAdapter } from './mock-transcription.adapter';
import { MockAudioSummaryAdapter } from './mock-audio-summary.adapter';

@Module({
    providers: [
        MockTranscriptionAdapter,
        MockAudioSummaryAdapter,
    ],
    exports: [
        MockTranscriptionAdapter,
        MockAudioSummaryAdapter,
    ],
})
export class MockLlmModule { }

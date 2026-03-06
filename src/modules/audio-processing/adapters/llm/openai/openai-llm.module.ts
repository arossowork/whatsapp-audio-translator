import { Module } from '@nestjs/common';
import { OpenaiTranscriptionAdapter } from './openai-transcription.adapter';
import { OpenaiAudioSummaryAdapter } from './openai-audio-summary.adapter';
import { TRANSCRIPTION_PORT, AUDIO_SUMMARY_PORT } from '../../../../_shared/core/ports/tokens';
import { LoggerProviderModule } from '../../../../_shared/adapters/logger/logger-provider.module';

@Module({
    imports: [LoggerProviderModule],
    providers: [
        {
            provide: TRANSCRIPTION_PORT,
            useClass: OpenaiTranscriptionAdapter,
        },
        {
            provide: AUDIO_SUMMARY_PORT,
            useClass: OpenaiAudioSummaryAdapter,
        },
    ],
    exports: [
        TRANSCRIPTION_PORT,
        AUDIO_SUMMARY_PORT,
    ],
})
export class OpenaiLlmModule { }

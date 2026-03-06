import { Module, Global } from '@nestjs/common';
import {
    AUDIO_PROCESSING_QUEUE_PORT,
    PROCESSED_AUDIO_QUEUE_PORT,
    AUDIO_ERROR_QUEUE_PORT,
    AUDIO_ERROR_DELIVERY_PORT,
    PROCESSED_AUDIO_DELIVERY_PORT,
    TRANSCRIPTION_PORT,
    AUDIO_SUMMARY_PORT,
    QR_CODE_DISPLAY_PORT,
} from './modules/_shared/core/ports/tokens';
import { QueueModule } from './modules/_shared/adapters/queue/queue.module';
import { WhatsappBotModule } from './modules/messaging/adapters/whatsapp-bot/whatsapp-bot.module';
import { MockLlmModule } from './modules/audio-processing/adapters/llm/mock-llm/mock-llm.module';
import { LoggerProviderModule } from './modules/_shared/adapters/logger/logger-provider.module';
import { DaprService } from './modules/_shared/adapters/dapr/dapr.service';
import { DaprQueueAdapter } from './modules/_shared/adapters/queue/dapr-queue.adapter';
import { WhatsappAudioErrorDeliveryAdapter } from './modules/messaging/adapters/whatsapp-bot/whatsapp-audio-error-delivery.adapter';
import { WhatsappProcessedAudioDeliveryAdapter } from './modules/messaging/adapters/whatsapp-bot/whatsapp-processed-audio-delivery.adapter';
import { MockTranscriptionAdapter } from './modules/audio-processing/adapters/llm/mock-llm/mock-transcription.adapter';
import { MockAudioSummaryAdapter } from './modules/audio-processing/adapters/llm/mock-llm/mock-audio-summary.adapter';
import { CliQrCodeDisplayAdapter } from './modules/user/adapters/qr-code-display/cli-qr-code-display.adapter';

const portProviders = [
    {
        provide: AUDIO_PROCESSING_QUEUE_PORT,
        useFactory: (daprService: DaprService) => new DaprQueueAdapter(daprService, 'app-pubsub', 'audio-processing'),
        inject: [DaprService],
    },
    {
        provide: PROCESSED_AUDIO_QUEUE_PORT,
        useFactory: (daprService: DaprService) => new DaprQueueAdapter(daprService, 'app-pubsub', 'processed-audio'),
        inject: [DaprService],
    },
    {
        provide: AUDIO_ERROR_QUEUE_PORT,
        useFactory: (daprService: DaprService) => new DaprQueueAdapter(daprService, 'app-pubsub', 'audio-error'),
        inject: [DaprService],
    },
    {
        provide: AUDIO_ERROR_DELIVERY_PORT,
        useExisting: WhatsappAudioErrorDeliveryAdapter,
    },
    {
        provide: PROCESSED_AUDIO_DELIVERY_PORT,
        useExisting: WhatsappProcessedAudioDeliveryAdapter,
    },
    {
        provide: TRANSCRIPTION_PORT,
        useExisting: MockTranscriptionAdapter,
    },
    {
        provide: AUDIO_SUMMARY_PORT,
        useExisting: MockAudioSummaryAdapter,
    },
    {
        provide: QR_CODE_DISPLAY_PORT,
        useClass: CliQrCodeDisplayAdapter, // Not dependent on CoreModule, can stay useClass
    },
];

@Global()
@Module({
    imports: [QueueModule, WhatsappBotModule, MockLlmModule, LoggerProviderModule],
    providers: portProviders,
    exports: portProviders.map(p => p.provide),
})
export class GlobalPortModule { }

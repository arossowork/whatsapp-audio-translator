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
} from './core/ports/tokens';
import { QueueModule } from './adapters/queue/queue.module';
import { WhatsappBotModule } from './adapters/whatsapp-bot/whatsapp-bot.module';
import { MockLlmModule } from './adapters/mock-llm/mock-llm.module';
import { LoggerProviderModule } from './providers/logger/logger-provider.module';
import { DaprService } from './providers/dapr/dapr.service';
import { DaprQueueAdapter } from './adapters/queue/dapr-queue.adapter';
import { WhatsappAudioErrorDeliveryAdapter } from './adapters/whatsapp-bot/whatsapp-audio-error-delivery.adapter';
import { WhatsappProcessedAudioDeliveryAdapter } from './adapters/whatsapp-bot/whatsapp-processed-audio-delivery.adapter';
import { MockTranscriptionAdapter } from './adapters/mock-llm/mock-transcription.adapter';
import { MockAudioSummaryAdapter } from './adapters/mock-llm/mock-audio-summary.adapter';
import { CliQrCodeDisplayAdapter } from './adapters/qr-code-display/cli-qr-code-display.adapter';

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
        useClass: WhatsappAudioErrorDeliveryAdapter,
    },
    {
        provide: PROCESSED_AUDIO_DELIVERY_PORT,
        useClass: WhatsappProcessedAudioDeliveryAdapter,
    },
    {
        provide: TRANSCRIPTION_PORT,
        useClass: MockTranscriptionAdapter,
    },
    {
        provide: AUDIO_SUMMARY_PORT,
        useClass: MockAudioSummaryAdapter,
    },
    {
        provide: QR_CODE_DISPLAY_PORT,
        useClass: CliQrCodeDisplayAdapter,
    },
];

@Global()
@Module({
    imports: [QueueModule, WhatsappBotModule, MockLlmModule, LoggerProviderModule],
    providers: portProviders,
    exports: portProviders.map(p => p.provide),
})
export class GlobalPortModule { }

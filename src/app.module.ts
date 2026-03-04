import { Module } from '@nestjs/common';
import { QueueModule } from './adapters/queue/queue.module';
import { DaprQueueAdapter } from './adapters/queue/dapr-queue.adapter';
import { DaprService } from './providers/dapr/dapr.service';
import { WhatsappBotModule } from './adapters/whatsapp-bot/whatsapp-bot.module';
import {
  AUDIO_PROCESSING_QUEUE_PORT,
  PROCESSED_AUDIO_QUEUE_PORT,
  AUDIO_ERROR_QUEUE_PORT,
  AUDIO_ERROR_DELIVERY_PORT,
  PROCESSED_AUDIO_DELIVERY_PORT,
  TRANSCRIPTION_PORT,
  AUDIO_SUMMARY_PORT
} from './core/ports/tokens';
import { WhatsappAudioErrorDeliveryAdapter } from './adapters/whatsapp-bot/whatsapp-audio-error-delivery.adapter';
import { WhatsappProcessedAudioDeliveryAdapter } from './adapters/whatsapp-bot/whatsapp-processed-audio-delivery.adapter';
import { MockLlmModule } from './adapters/mock-llm/mock-llm.module';
import { MockTranscriptionAdapter } from './adapters/mock-llm/mock-transcription.adapter';
import { MockAudioSummaryAdapter } from './adapters/mock-llm/mock-audio-summary.adapter';

/**
 * AppModule composes all adapter modules.
 * No adapter imports another adapter directly here or anywhere — Rule 2.
 */
@Module({
  imports: [QueueModule, WhatsappBotModule, MockLlmModule],
  providers: [
    {
      provide: AUDIO_PROCESSING_QUEUE_PORT,
      useFactory: (daprService: DaprService) => new DaprQueueAdapter(daprService, 'pubsub', 'audio-processing'),
      inject: [DaprService],
    },
    {
      provide: PROCESSED_AUDIO_QUEUE_PORT,
      useFactory: (daprService: DaprService) => new DaprQueueAdapter(daprService, 'pubsub', 'processed-audio'),
      inject: [DaprService],
    },
    {
      provide: AUDIO_ERROR_QUEUE_PORT,
      useFactory: (daprService: DaprService) => new DaprQueueAdapter(daprService, 'pubsub', 'audio-error'),
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
  ],
})
export class AppModule { }

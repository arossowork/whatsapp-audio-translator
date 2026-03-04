import { Module } from '@nestjs/common';
import { QueueModule } from './adapters/queue/queue.module';
import { DaprQueueAdapter } from './adapters/queue/dapr-queue.adapter';
import { DaprService } from './providers/dapr/dapr.service';
import {
  AUDIO_PROCESSING_QUEUE_PORT,
  PROCESSED_AUDIO_QUEUE_PORT,
  AUDIO_ERROR_QUEUE_PORT
} from './core/ports/tokens';

/**
 * AppModule composes all adapter modules.
 * No adapter imports another adapter directly here or anywhere — Rule 2.
 */
@Module({
  imports: [QueueModule],
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
  ],
})
export class AppModule { }

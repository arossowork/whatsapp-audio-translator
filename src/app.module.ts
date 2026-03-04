import { Module } from '@nestjs/common';
import { QueueModule } from './adapters/queue/queue.module';
import { GenericQueueAdapter } from './adapters/queue/generic-queue.adapter';
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
    { provide: AUDIO_PROCESSING_QUEUE_PORT, useClass: GenericQueueAdapter },
    { provide: PROCESSED_AUDIO_QUEUE_PORT, useClass: GenericQueueAdapter },
    { provide: AUDIO_ERROR_QUEUE_PORT, useClass: GenericQueueAdapter },
  ],
})
export class AppModule { }

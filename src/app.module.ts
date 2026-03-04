import { Module } from '@nestjs/common';
import { ApiInModule } from './adapters/api-in/api-in.module';
import { LlmModule } from './adapters/llm/llm.module';
import { QueueModule } from './adapters/queue/queue.module';
import { ReplyQueueModule } from './adapters/reply-queue/reply-queue.module';

/**
 * AppModule composes all adapter modules.
 * No adapter imports another adapter directly here or anywhere — Rule 2.
 */
@Module({
  imports: [ApiInModule, QueueModule, ReplyQueueModule, LlmModule],
})
export class AppModule { }

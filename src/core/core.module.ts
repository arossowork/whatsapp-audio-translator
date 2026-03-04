import { Module } from '@nestjs/common';
import { SendToQueueUseCase } from './use-cases/send-to-queue.use-case';
import { ProcessFromQueueUseCase } from './use-cases/process-from-queue.use-case';
import { DeliverResponseUseCase } from './use-cases/deliver-response.use-case';

/**
 * CoreModule — pure application logic.
 *
 * Rules:
 *  - No infrastructure imports (no HTTP, DB, queue drivers).
 *  - Port bindings (QUEUE_PORT, LLM_PORT, etc.) are provided by adapter modules.
 *  - This module only exports use cases; adapters inject them.
 */
@Module({
    providers: [
        SendToQueueUseCase,
        ProcessFromQueueUseCase,
        DeliverResponseUseCase,
    ],
    exports: [
        SendToQueueUseCase,
        ProcessFromQueueUseCase,
        DeliverResponseUseCase,
    ],
})
export class CoreModule { }

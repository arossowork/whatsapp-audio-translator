import { Module } from '@nestjs/common';
import { ReceiveWhatsappAudioUseCase } from './use-cases/receive-whatsapp-audio.use-case';
import { ProcessAudioUseCase } from './use-cases/process-audio.use-case';
import { DeliverProcessedAudioUseCase } from './use-cases/deliver-processed-audio.use-case';
import { DeliverAudioErrorUseCase } from './use-cases/deliver-audio-error.use-case';

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
        ReceiveWhatsappAudioUseCase,
        ProcessAudioUseCase,
        DeliverProcessedAudioUseCase,
        DeliverAudioErrorUseCase,
    ],
    exports: [
        ReceiveWhatsappAudioUseCase,
        ProcessAudioUseCase,
        DeliverProcessedAudioUseCase,
        DeliverAudioErrorUseCase,
    ],
})
export class CoreModule { }

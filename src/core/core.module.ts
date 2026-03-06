import { Module } from '@nestjs/common';
import { ReceiveWhatsappAudioUseCase } from '../modules/messaging/core/use-cases/receive-whatsapp-audio.use-case';
import { ProcessAudioUseCase } from '../modules/audio-processing/core/use-cases/process-audio.use-case';
import { DeliverProcessedAudioUseCase } from '../modules/messaging/core/use-cases/deliver-processed-audio.use-case';
import { DeliverAudioErrorUseCase } from '../modules/messaging/core/use-cases/deliver-audio-error.use-case';
import { PresentQrCodeUseCase } from '../modules/user/core/use-cases/present-qr-code.use-case';

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
        PresentQrCodeUseCase,
    ],
    exports: [
        ReceiveWhatsappAudioUseCase,
        ProcessAudioUseCase,
        DeliverProcessedAudioUseCase,
        DeliverAudioErrorUseCase,
        PresentQrCodeUseCase,
    ],
})
export class CoreModule { }

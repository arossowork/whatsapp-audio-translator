import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { API_REPLY_PORT } from '../../core/ports/tokens';
import { ApiReplyAdapter } from './api-reply.adapter';
import { ApiInController } from './api-in.controller';

/**
 * ApiInModule:
 *  - Binds API_REPLY_PORT to ApiReplyAdapter (singleton, shared between controller + core)
 *  - Registers the HTTP controller
 *  - Only imports CoreModule (Rule 2 — no cross-adapter imports)
 */
@Module({
    imports: [CoreModule],
    controllers: [ApiInController],
    providers: [
        { provide: API_REPLY_PORT, useClass: ApiReplyAdapter },
        // Also expose the concrete class so the controller can call getReplies()
        ApiReplyAdapter,
    ],
})
export class ApiInModule { }

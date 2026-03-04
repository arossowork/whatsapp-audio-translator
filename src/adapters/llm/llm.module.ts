import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { LLM_PORT } from '../../core/ports/tokens';
import { LlmAdapter } from './llm.adapter';

@Module({
    imports: [CoreModule],
    providers: [{ provide: LLM_PORT, useClass: LlmAdapter }],
})
export class LlmModule { }

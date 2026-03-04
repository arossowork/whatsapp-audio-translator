import { Module } from '@nestjs/common';
import { WhatsappBotService } from './whatsapp-bot.service';
import { CoreModule } from '../../core/core.module';

@Module({
    imports: [CoreModule],
    providers: [WhatsappBotService],
    exports: [WhatsappBotService],
})
export class WhatsappBotModule { }

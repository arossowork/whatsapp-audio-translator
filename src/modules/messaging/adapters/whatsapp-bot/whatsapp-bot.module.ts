import { Module } from '@nestjs/common';
import { WhatsappBotService } from './whatsapp-bot.service';
import { WhatsappAudioErrorDeliveryAdapter } from './whatsapp-audio-error-delivery.adapter';
import { WhatsappProcessedAudioDeliveryAdapter } from './whatsapp-processed-audio-delivery.adapter';
import { CoreModule } from '../../../../core/core.module';

@Module({
    imports: [CoreModule],
    providers: [
        WhatsappBotService,
        WhatsappAudioErrorDeliveryAdapter,
        WhatsappProcessedAudioDeliveryAdapter,
    ],
    exports: [
        WhatsappBotService,
        WhatsappAudioErrorDeliveryAdapter,
        WhatsappProcessedAudioDeliveryAdapter,
    ],
})
export class WhatsappBotModule { }

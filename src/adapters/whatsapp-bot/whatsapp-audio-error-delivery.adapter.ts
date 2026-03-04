import { Injectable } from '@nestjs/common';
import { AudioErrorDeliveryPort } from '../../core/ports/audio-error-delivery.port';
import { AudioProcessingError } from '../../core/domain/audio-processing-error.entity';
import { WhatsappBotService } from './whatsapp-bot.service';

@Injectable()
export class WhatsappAudioErrorDeliveryAdapter implements AudioErrorDeliveryPort {
    constructor(private readonly whatsappBotService: WhatsappBotService) { }

    async deliver(error: AudioProcessingError): Promise<void> {
        const text = `❌ Error processing your audio: ${error.reason}`;
        await this.whatsappBotService.replyToMessage(error.whatsappAudioId, text);
    }
}

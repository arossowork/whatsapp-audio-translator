import { Injectable, Logger } from '@nestjs/common';
import { AudioErrorDeliveryPort } from '../../core/ports/audio-error-delivery.port';
import { AudioProcessingError } from '../../../audio-processing/co../../core/domain/audio-processing-error.entity';
import { WhatsappBotService } from './whatsapp-bot.service';

@Injectable()
export class WhatsappAudioErrorDeliveryAdapter implements AudioErrorDeliveryPort {
    private readonly logger = new Logger(WhatsappAudioErrorDeliveryAdapter.name);

    constructor(private readonly whatsappBotService: WhatsappBotService) { }

    async deliver(error: AudioProcessingError): Promise<void> {
        this.logger.log(`Delivering error reply for audioId=${error.whatsappAudioId}: ${error.reason}`);

        const text = `❌ Error processing your audio: ${error.reason}`;
        await this.whatsappBotService.replyToMessage(error.whatsappAudioId, text);

        this.logger.log(`Error reply delivered for audioId=${error.whatsappAudioId}`);
    }
}

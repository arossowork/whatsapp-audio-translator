import { Injectable, Logger } from '@nestjs/common';
import { ProcessedAudioDeliveryPort } from '../../core/ports/processed-audio-delivery.port';
import { ProcessedAudio } from '../../../audio-processing/co../../core/domain/processed-audio.entity';
import { WhatsappBotService } from './whatsapp-bot.service';

@Injectable()
export class WhatsappProcessedAudioDeliveryAdapter implements ProcessedAudioDeliveryPort {
    private readonly logger = new Logger(WhatsappProcessedAudioDeliveryAdapter.name);

    constructor(private readonly whatsappBotService: WhatsappBotService) { }

    async deliver(processedAudio: ProcessedAudio): Promise<void> {
        this.logger.log(`Delivering processed audio reply for audioId=${processedAudio.whatsappAudioId}`);

        const text = `✅ *Transcription:*\n${processedAudio.transcription.fullText}\n\n📝 *Summary:*\n${processedAudio.summary}`;
        await this.whatsappBotService.replyToMessage(processedAudio.whatsappAudioId, text);

        this.logger.log(`Processed audio reply delivered for audioId=${processedAudio.whatsappAudioId}`);
    }
}

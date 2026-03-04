import { Injectable } from '@nestjs/common';
import { ProcessedAudioDeliveryPort } from '../../core/ports/processed-audio-delivery.port';
import { ProcessedAudio } from '../../core/domain/processed-audio.entity';
import { WhatsappBotService } from './whatsapp-bot.service';

@Injectable()
export class WhatsappProcessedAudioDeliveryAdapter implements ProcessedAudioDeliveryPort {
    constructor(private readonly whatsappBotService: WhatsappBotService) { }

    async deliver(processedAudio: ProcessedAudio): Promise<void> {
        const text = `✅ *Transcription:*\n${processedAudio.transcription.fullText}\n\n📝 *Summary:*\n${processedAudio.summary}`;
        await this.whatsappBotService.replyToMessage(processedAudio.whatsappAudioId, text);
    }
}

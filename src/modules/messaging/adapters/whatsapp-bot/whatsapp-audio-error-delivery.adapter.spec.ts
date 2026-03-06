import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappAudioErrorDeliveryAdapter } from './whatsapp-audio-error-delivery.adapter';
import { WhatsappBotService } from './whatsapp-bot.service';
import { AudioProcessingError } from '../../../audio-processing/core/domain/audio-processing-error.entity';

describe('WhatsappAudioErrorDeliveryAdapter', () => {
    let adapter: WhatsappAudioErrorDeliveryAdapter;
    let botService: jest.Mocked<WhatsappBotService>;

    beforeEach(async () => {
        const mockBotService = {
            replyToMessage: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WhatsappAudioErrorDeliveryAdapter,
                {
                    provide: WhatsappBotService,
                    useValue: mockBotService,
                },
            ],
        }).compile();

        adapter = module.get<WhatsappAudioErrorDeliveryAdapter>(WhatsappAudioErrorDeliveryAdapter);
        botService = module.get(WhatsappBotService);
    });

    it('should be defined', () => {
        expect(adapter).toBeDefined();
    });

    describe('deliver', () => {
        it('should call botService.replyToMessage with the correctly formatted error message', async () => {
            const error = new AudioProcessingError('msg_123', 'Failed to transcribe audio due to low quality.');

            await adapter.deliver(error);

            expect(botService.replyToMessage).toHaveBeenCalledTimes(1);
            expect(botService.replyToMessage).toHaveBeenCalledWith('msg_123', '❌ Error processing your audio: Failed to transcribe audio due to low quality.');
        });
    });
});

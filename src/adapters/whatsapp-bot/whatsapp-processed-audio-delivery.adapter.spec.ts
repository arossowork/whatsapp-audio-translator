import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappProcessedAudioDeliveryAdapter } from './whatsapp-processed-audio-delivery.adapter';
import { WhatsappBotService } from './whatsapp-bot.service';
import { ProcessedAudio } from '../../core/domain/processed-audio.entity';

describe('WhatsappProcessedAudioDeliveryAdapter', () => {
    let adapter: WhatsappProcessedAudioDeliveryAdapter;
    let botService: jest.Mocked<WhatsappBotService>;

    beforeEach(async () => {
        const mockBotService = {
            replyToMessage: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WhatsappProcessedAudioDeliveryAdapter,
                {
                    provide: WhatsappBotService,
                    useValue: mockBotService,
                },
            ],
        }).compile();

        adapter = module.get<WhatsappProcessedAudioDeliveryAdapter>(WhatsappProcessedAudioDeliveryAdapter);
        botService = module.get(WhatsappBotService);
    });

    it('should be defined', () => {
        expect(adapter).toBeDefined();
    });

    describe('deliver', () => {
        it('should call botService.replyToMessage with the correctly formatted success message', async () => {
            const processedAudio = new ProcessedAudio(
                'msg_123',
                { fullText: 'Hello world, this is a test', segments: [] },
                'User is testing the application'
            );

            await adapter.deliver(processedAudio);

            expect(botService.replyToMessage).toHaveBeenCalledTimes(1);
            expect(botService.replyToMessage).toHaveBeenCalledWith(
                'msg_123',
                `✅ *Transcription:*\nHello world, this is a test\n\n📝 *Summary:*\nUser is testing the application`
            );
        });
    });
});

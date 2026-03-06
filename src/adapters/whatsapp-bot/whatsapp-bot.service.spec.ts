import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappBotService } from './whatsapp-bot.service';
import { ReceiveWhatsappAudioUseCase } from '../../core/use-cases/receive-whatsapp-audio.use-case';
import { PresentQrCodeUseCase } from '../../core/use-cases/present-qr-code.use-case';
import { WhatsappAudio } from '../../core/domain/whatsapp-audio.entity';

describe('WhatsappBotService', () => {
    let service: WhatsappBotService;
    let receiveWhatsappAudioUseCase: jest.Mocked<ReceiveWhatsappAudioUseCase>;
    let presentQrCodeUseCase: jest.Mocked<PresentQrCodeUseCase>;

    beforeEach(async () => {
        const mockUseCase = {
            execute: jest.fn(),
        };

        const mockPresentQrCodeUseCase = {
            execute: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WhatsappBotService,
                {
                    provide: ReceiveWhatsappAudioUseCase,
                    useValue: mockUseCase,
                },
                {
                    provide: PresentQrCodeUseCase,
                    useValue: mockPresentQrCodeUseCase,
                },
            ],
        }).compile();

        service = module.get<WhatsappBotService>(WhatsappBotService);
        receiveWhatsappAudioUseCase = module.get(ReceiveWhatsappAudioUseCase);
        presentQrCodeUseCase = module.get(PresentQrCodeUseCase);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('when a QR code is generated', () => {
        it('should call PresentQrCodeUseCase with the QR code string', () => {
            // We will simulate the 'qr' event on the client.
            // Since the client is internal, we can test the expected behavior by testing handleQr logic
            const qrString = 'fake_qr_code_string';
            service.handleQr(qrString);

            expect(presentQrCodeUseCase.execute).toHaveBeenCalledTimes(1);
            expect(presentQrCodeUseCase.execute).toHaveBeenCalledWith(
                expect.objectContaining({ value: qrString })
            );
        });
    });

    describe('when receiving a message', () => {
        it('should call ReceiveWhatsappAudioUseCase when an audio message is received', async () => {
            // Act: Simulate receiving an audio message (e.g. 'ptt' or 'audio' type in whatsapp-web.js)
            const mockAudioMessage = {
                id: { _serialized: 'msg123' },
                hasMedia: true,
                type: 'ptt', // voice note
                from: '123456789@c.us',
                to: '987654321@c.us',
                downloadMedia: jest.fn().mockResolvedValue({ data: 'base64audio_content' }),
            };

            await service.handleMessage(mockAudioMessage as any);

            // Assert
            expect(receiveWhatsappAudioUseCase.execute).toHaveBeenCalledTimes(1);

            // Check that the entity created matches expectations
            const calledArg = receiveWhatsappAudioUseCase.execute.mock.calls[0][0];
            expect(calledArg).toBeInstanceOf(WhatsappAudio);
            expect(calledArg.id).toBe('msg123');
            expect(calledArg.sender).toBe('123456789@c.us');
            expect(calledArg.receiver).toBe('987654321@c.us');
            expect(calledArg.audioContent).toBe('base64audio_content');
        });

        it('should ignore non-audio messages', async () => {
            const mockTextMessage = {
                id: { _serialized: 'msg456' },
                hasMedia: false,
                type: 'chat',
                from: '123456789@c.us',
                to: '987654321@c.us',
                downloadMedia: jest.fn(),
            };

            await service.handleMessage(mockTextMessage as any);

            expect(receiveWhatsappAudioUseCase.execute).not.toHaveBeenCalled();
        });
    });
});

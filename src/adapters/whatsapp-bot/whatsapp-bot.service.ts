import { Injectable, Inject, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import { randomUUID } from 'crypto';
import { ReceiveWhatsappAudioUseCase } from '../../core/use-cases/receive-whatsapp-audio.use-case';
import { PresentQrCodeUseCase } from '../../core/use-cases/present-qr-code.use-case';
import { WhatsappAudio } from '../../core/domain/whatsapp-audio.entity';
import { QrCode } from '../../core/domain/qr-code.entity';
import type { CorrelationContextPort } from '../../core/ports/correlation-context.port';
import { CORRELATION_CONTEXT_PORT } from '../../core/ports/tokens';

@Injectable()
export class WhatsappBotService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(WhatsappBotService.name);
    private client: Client;

    constructor(
        private readonly receiveWhatsappAudio: ReceiveWhatsappAudioUseCase,
        private readonly presentQrCodeUseCase: PresentQrCodeUseCase,
        @Inject(CORRELATION_CONTEXT_PORT)
        private readonly correlationContext: CorrelationContextPort,
    ) { }

    async onModuleInit() {
        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            }
        });

        this.client.on('qr', (qr) => {
            this.handleQr(qr);
        });

        this.client.on('ready', () => {
            this.logger.log('WhatsApp Client is ready!');
        });

        this.client.on('message', async (message: Message) => {
            await this.handleMessage(message);
        });

        this.client.initialize().catch((err) => {
            this.logger.error('Failed to initialize WhatsApp client', err);
        });
    }

    async onModuleDestroy() {
        if (this.client) {
            await this.client.destroy();
        }
    }

    handleQr(qr: string): void {
        try {
            const qrCodeEntity = new QrCode(qr);
            this.presentQrCodeUseCase.execute(qrCodeEntity);
        } catch (error) {
            this.logger.error('Failed to present QR code', error);
        }
    }

    async handleMessage(message: any): Promise<void> {
        this.logger.log(`Message received from ${message.from} — type=${message.type} hasMedia=${message.hasMedia}`);

        // Types from whatsapp-web.js: 'ptt' for voice notes, 'audio' for audio files
        if (message.hasMedia && (message.type === 'ptt' || message.type === 'audio')) {
            const correlationId = randomUUID();
            const whatsappAudioId = message.id._serialized;

            this.logger.log(`[cid=${correlationId}] [audioId=${whatsappAudioId}] Audio message detected — downloading media`);

            try {
                const media = await message.downloadMedia();

                const audio = new WhatsappAudio(
                    whatsappAudioId,
                    media.data, // base64 representation
                    message.from,
                    message.to,
                    new Date(),
                );

                this.logger.log(`[cid=${correlationId}] [audioId=${whatsappAudioId}] Media downloaded — forwarding to use case`);

                this.correlationContext.run(
                    { correlationId, whatsappAudioId },
                    () => this.receiveWhatsappAudio.execute(audio),
                );
            } catch (error) {
                this.logger.error(`[cid=${correlationId}] [audioId=${whatsappAudioId}] Failed to process audio message`, error);
            }
        }
    }

    async replyToMessage(messageId: string, text: string): Promise<void> {
        try {
            const message = await this.client.getMessageById(messageId);
            if (message) {
                await message.reply(text);
                this.logger.log(`Replied to message ${messageId}`);
            } else {
                this.logger.warn(`Could not find message with ID ${messageId} to reply to`);
            }
        } catch (error) {
            this.logger.error(`Failed to reply to message ${messageId}`, error);
        }
    }
}

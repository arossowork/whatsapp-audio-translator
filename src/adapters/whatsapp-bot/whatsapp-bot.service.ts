import { Injectable, Inject, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import { ReceiveWhatsappAudioUseCase } from '../../core/use-cases/receive-whatsapp-audio.use-case';
import { WhatsappAudio } from '../../core/domain/whatsapp-audio.entity';

@Injectable()
export class WhatsappBotService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(WhatsappBotService.name);
    private client: Client;

    constructor(
        private readonly receiveWhatsappAudio: ReceiveWhatsappAudioUseCase,
    ) { }

    async onModuleInit() {
        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            }
        });

        this.client.on('qr', (qr) => {
            this.logger.log('Scan this QR code in WhatsApp to log in:');
            qrcode.generate(qr, { small: true });
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

    async handleMessage(message: any): Promise<void> {
        // Types from whatsapp-web.js: 'ptt' for voice notes, 'audio' for audio files
        if (message.hasMedia && (message.type === 'ptt' || message.type === 'audio')) {
            try {
                const media = await message.downloadMedia();

                const audio = new WhatsappAudio(
                    message.id._serialized,
                    media.data, // base64 representation
                    message.from,
                    message.to,
                    new Date() // Using default in constructor is fine, but can explicitly pass if needed
                );

                this.receiveWhatsappAudio.execute(audio);
                this.logger.log(`Received and processed audio message from ${message.from}`);
            } catch (error) {
                this.logger.error(`Failed to process audio message from ${message.from}`, error);
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

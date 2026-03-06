import { Injectable, Inject } from '@nestjs/common';
import { TranscriptionPort } from '../../../core/ports/transcription.port';
import { Transcription, TranscriptionSegment } from '../../../core/domain/transcription.entity';
import type { LoggerPort } from '../../../../_shared/core/ports/logger.port';
import { LOGGER_PORT } from '../../../../_shared/core/ports/tokens';
import OpenAI from 'openai';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFileSync, unlinkSync } from 'fs';
import { createReadStream } from 'fs';

@Injectable()
export class OpenaiTranscriptionAdapter implements TranscriptionPort {
    private readonly openai: OpenAI;

    constructor(
        @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    ) {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async transcribe(whatsappAudioId: string, audioContent: string): Promise<Transcription> {
        this.logger.log('OpenaiTranscriptionAdapter', `Transcribing audio ${whatsappAudioId} via OpenAI Whisper`);
        const tempFilePath = join(tmpdir(), `${whatsappAudioId}.ogg`);

        try {
            // Whisper API requires an actual file stream, so we temporarily write the base64 to disk
            const audioBuffer = Buffer.from(audioContent, 'base64');
            writeFileSync(tempFilePath, audioBuffer);

            const response = await this.openai.audio.transcriptions.create({
                file: createReadStream(tempFilePath),
                model: 'whisper-1',
                response_format: 'verbose_json',
            });

            const segments = (response.segments || []).map(
                (seg: any) => new TranscriptionSegment(seg.start, seg.end, seg.text)
            );

            this.logger.log('OpenaiTranscriptionAdapter', `Transcription successful for audio ${whatsappAudioId}`);
            return new Transcription(whatsappAudioId, segments, response.text);
        } catch (error: any) {
            this.logger.error('OpenaiTranscriptionAdapter', `Transcription failed for audio ${whatsappAudioId}: ${error.message}`, error.stack);
            throw error;
        } finally {
            try {
                unlinkSync(tempFilePath);
            } catch (cleanupError) {
                // Ignore cleanup errors
            }
        }
    }
}

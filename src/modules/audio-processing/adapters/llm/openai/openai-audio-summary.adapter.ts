import { Injectable, Inject } from '@nestjs/common';
import { AudioSummaryPort } from '../../../core/ports/audio-summary.port';
import { Transcription } from '../../../core/domain/transcription.entity';
import type { LoggerPort } from '../../../../_shared/core/ports/logger.port';
import { LOGGER_PORT } from '../../../../_shared/core/ports/tokens';
import OpenAI from 'openai';

@Injectable()
export class OpenaiAudioSummaryAdapter implements AudioSummaryPort {
    private readonly openai: OpenAI;
    private readonly systemPrompt: string;

    constructor(
        @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    ) {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        this.systemPrompt = `You are an expert summarizer. 
Your task is to provide a concise, accurate summary of the provided text transcription.
The summary should be no longer than 3-4 sentences.
Capture the main points and intent of the speaker.`;
    }

    async summarize(transcription: Transcription): Promise<string> {
        this.logger.log('OpenaiAudioSummaryAdapter', `Summarizing transcription for audio ${transcription.whatsappAudioId}`);

        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: this.systemPrompt },
                    { role: 'user', content: transcription.fullText },
                ],
                temperature: 0.3, // Lower temperature for more focused/deterministic summaries
            });

            const summaryContent = response.choices[0]?.message?.content || '';

            if (!summaryContent) {
                throw new Error('OpenAI returned an empty summary');
            }

            this.logger.log('OpenaiAudioSummaryAdapter', `Summary created successfully for audio ${transcription.whatsappAudioId}`);
            return summaryContent;
        } catch (error: any) {
            this.logger.error('OpenaiAudioSummaryAdapter', `Summary generation failed for audio ${transcription.whatsappAudioId}: ${error.message}`, error.stack);
            throw error;
        }
    }
}

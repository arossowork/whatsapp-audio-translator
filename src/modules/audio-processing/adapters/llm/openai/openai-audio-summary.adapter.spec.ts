import { OpenaiAudioSummaryAdapter } from './openai-audio-summary.adapter';
import OpenAI from 'openai';
import { Transcription, TranscriptionSegment } from '../../../core/domain/transcription.entity';

jest.mock('openai');

describe('OpenaiAudioSummaryAdapter', () => {
    let adapter: OpenaiAudioSummaryAdapter;
    let mockOpenAlInstance: any;

    beforeEach(() => {
        jest.clearAllMocks();

        mockOpenAlInstance = {
            chat: {
                completions: {
                    create: jest.fn()
                }
            }
        };
        (OpenAI as unknown as jest.Mock).mockImplementation(() => mockOpenAlInstance);

        const mockLogger = {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
        };

        adapter = new OpenaiAudioSummaryAdapter(mockLogger as any);
    });

    it('should summarize transcription using OpenAI Chat API', async () => {
        const segments = [
            new TranscriptionSegment(0, 1.5, 'This is a test transcription.'),
        ];
        const transcription = new Transcription('test-audio-123', segments, 'This is a test transcription.');

        mockOpenAlInstance.chat.completions.create.mockResolvedValue({
            choices: [{
                message: {
                    content: 'This is a summary.'
                }
            }]
        });

        const result = await adapter.summarize(transcription);

        expect(result).toBe('This is a summary.');

        expect(mockOpenAlInstance.chat.completions.create).toHaveBeenCalledWith(
            expect.objectContaining({
                model: 'gpt-4o',
                messages: expect.arrayContaining([
                    expect.objectContaining({ role: 'system' }),
                    expect.objectContaining({ role: 'user', content: transcription.fullText })
                ])
            })
        );
    });
});

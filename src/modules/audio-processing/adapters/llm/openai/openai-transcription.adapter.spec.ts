import { OpenaiTranscriptionAdapter } from './openai-transcription.adapter';
import OpenAI from 'openai';
import { Transcription } from '../../../core/domain/transcription.entity';
import * as fs from 'fs';

jest.mock('openai');
jest.mock('fs', () => ({
    writeFileSync: jest.fn(),
    unlinkSync: jest.fn(),
    createReadStream: jest.fn().mockReturnValue('mock-stream'),
}));

describe('OpenaiTranscriptionAdapter', () => {
    let adapter: OpenaiTranscriptionAdapter;
    let mockOpenAlInstance: any;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock the implementation of the class to return our specific spy object
        mockOpenAlInstance = {
            audio: {
                transcriptions: {
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

        adapter = new OpenaiTranscriptionAdapter(mockLogger);
    });

    it('should transcribe audio using OpenAI Whisper', async () => {
        const audioId = 'test-audio-123';
        const base64Audio = 'base64-encoded-audio-content';

        mockOpenAlInstance.audio.transcriptions.create.mockResolvedValue({
            text: 'This is a test transcription.',
            segments: [
                { start: 0, end: 1.5, text: 'This is a' },
                { start: 1.5, end: 3.0, text: 'test transcription.' }
            ]
        });

        const result = await adapter.transcribe(audioId, base64Audio);

        expect(result).toBeInstanceOf(Transcription);
        expect(result.whatsappAudioId).toBe(audioId);
        expect(result.fullText).toBe('This is a test transcription.');
        expect(result.segments).toHaveLength(2);

        expect(mockOpenAlInstance.audio.transcriptions.create).toHaveBeenCalledWith(
            expect.objectContaining({
                model: 'whisper-1',
                response_format: 'verbose_json',
            })
        );
    });
});

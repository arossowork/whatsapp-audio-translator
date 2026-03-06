import { OpenaiTranscriptionAdapter } from './openai-transcription.adapter';
import OpenAI from 'openai';
import { Transcription } from '../../../core/domain/transcription.entity';
import * as fs from 'fs';
import { LoggerPort } from '../../../../_shared/core/ports/logger.port';

jest.mock('openai');
jest.mock('fs', () => ({
    writeFileSync: jest.fn(),
    unlinkSync: jest.fn(),
    createReadStream: jest.fn().mockReturnValue('mock-stream'),
}));

describe('OpenaiTranscriptionAdapter', () => {
    let adapter: OpenaiTranscriptionAdapter;
    let mockOpenAlInstance: any;
    let loggerMock: jest.Mocked<LoggerPort>;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock environment variable
        process.env.OPENAI_API_KEY = Buffer.from('test-api-key').toString('base64');

        // Mock the implementation of the class to return our specific spy object
        mockOpenAlInstance = {
            audio: {
                transcriptions: {
                    create: jest.fn()
                }
            }
        };
        (OpenAI as unknown as jest.Mock).mockImplementation(() => mockOpenAlInstance);

        loggerMock = {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            verbose: jest.fn(),
        } as unknown as jest.Mocked<LoggerPort>;

        adapter = new OpenaiTranscriptionAdapter(loggerMock);
    });

    afterEach(() => {
        delete process.env.OPENAI_API_KEY;
        jest.clearAllMocks();
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

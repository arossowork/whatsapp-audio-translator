import { Test, TestingModule } from '@nestjs/testing';
import { MockTranscriptionAdapter } from './mock-transcription.adapter';
import { Transcription } from '../../core/domain/transcription.entity';

describe('MockTranscriptionAdapter', () => {
    let adapter: MockTranscriptionAdapter;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MockTranscriptionAdapter],
        }).compile();

        adapter = module.get<MockTranscriptionAdapter>(MockTranscriptionAdapter);
    });

    it('should be defined', () => {
        expect(adapter).toBeDefined();
    });

    describe('transcribe', () => {
        it('should return a dummy Transcription entity matching the given ID', async () => {
            const transcriptionId = 'whatsapp_audio_789';
            const base64Audio = 'dummy_base64_data';

            const result = await adapter.transcribe(transcriptionId, base64Audio);

            expect(result).toBeInstanceOf(Transcription);
            expect(result.whatsappAudioId).toBe(transcriptionId);
            expect(typeof result.fullText).toBe('string');
            expect(result.fullText.length).toBeGreaterThan(0);
            expect(Array.isArray(result.segments)).toBe(true);
        });
    });
});

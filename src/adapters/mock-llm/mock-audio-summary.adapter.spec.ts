import { Test, TestingModule } from '@nestjs/testing';
import { MockAudioSummaryAdapter } from './mock-audio-summary.adapter';
import { Transcription } from '../../core/domain/transcription.entity';

describe('MockAudioSummaryAdapter', () => {
    let adapter: MockAudioSummaryAdapter;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MockAudioSummaryAdapter],
        }).compile();

        adapter = module.get<MockAudioSummaryAdapter>(MockAudioSummaryAdapter);
    });

    it('should be defined', () => {
        expect(adapter).toBeDefined();
    });

    describe('summarize', () => {
        it('should return a mock summary string', async () => {
            const transcription = new Transcription('msg_1', [], 'A long body of text goes here...');

            const result = await adapter.summarize(transcription);

            expect(typeof result).toBe('string');
            expect(result).toContain('[MOCK SUMMARY]');
            expect(result.length).toBeGreaterThan(0);
        });
    });
});

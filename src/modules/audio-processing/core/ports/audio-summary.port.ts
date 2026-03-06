import { Transcription } from '../../core/domain/transcription.entity';

export interface AudioSummaryPort {
    summarize(transcription: Transcription): Promise<string>;
}

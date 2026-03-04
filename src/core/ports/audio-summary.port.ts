import { Transcription } from '../domain/transcription.entity';

export interface AudioSummaryPort {
    summarize(transcription: Transcription): Promise<string>;
}

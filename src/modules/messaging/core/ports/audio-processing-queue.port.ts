import { WhatsappAudio } from '../domain/whatsapp-audio.entity';

export interface AudioProcessingQueuePort {
    enqueue(audio: WhatsappAudio): void;
    subscribe(callback: (audio: WhatsappAudio) => void): void;
}

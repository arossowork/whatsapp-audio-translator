import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ProcessFromQueueUseCase } from '../../core/use-cases/process-from-queue.use-case';

/**
 * Adapter-layer poller (Rule 6 — polling is adapter responsibility).
 * Pulls jobs from the in-memory queue every 500ms and sends them to the LLM via core.
 */
@Injectable()
export class QueueJobPoller implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(QueueJobPoller.name);
    private intervalId: NodeJS.Timeout | null = null;

    constructor(private readonly processFromQueue: ProcessFromQueueUseCase) { }

    onModuleInit(): void {
        this.intervalId = setInterval(() => void this.poll(), 500);
        this.logger.log('Queue job poller started (interval: 500ms)');
    }

    onModuleDestroy(): void {
        if (this.intervalId) clearInterval(this.intervalId);
        this.logger.log('Queue job poller stopped');
    }

    private async poll(): Promise<void> {
        try {
            await this.processFromQueue.execute();
        } catch (err) {
            this.logger.error('Error processing queue job', err);
        }
    }
}

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { DeliverResponseUseCase } from '../../core/use-cases/deliver-response.use-case';

/**
 * Adapter-layer poller (Rule 6).
 * Pulls replies from the reply queue every 500ms and delivers them to API-in via core.
 */
@Injectable()
export class ReplyQueuePoller implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(ReplyQueuePoller.name);
    private intervalId: NodeJS.Timeout | null = null;

    constructor(private readonly deliverResponse: DeliverResponseUseCase) { }

    onModuleInit(): void {
        this.intervalId = setInterval(() => this.poll(), 500);
        this.logger.log('Reply queue poller started (interval: 500ms)');
    }

    onModuleDestroy(): void {
        if (this.intervalId) clearInterval(this.intervalId);
        this.logger.log('Reply queue poller stopped');
    }

    private poll(): void {
        try {
            this.deliverResponse.execute();
        } catch (err) {
            this.logger.error('Error delivering reply', err);
        }
    }
}

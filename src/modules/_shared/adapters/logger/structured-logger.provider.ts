import { Injectable, Inject, Optional } from '@nestjs/common';
import type { LoggerPort } from '../../core/ports/logger.port';
import type { CorrelationContextPort } from '../../core/ports/correlation-context.port';
import { CORRELATION_CONTEXT_PORT } from '../../core/ports/tokens';
import type { LogLevelConfig } from './log-level-config';
import {
    LOG_LEVEL_CONFIG,
    isLevelEnabled,
    resolveLogLevel,
} from './log-level-config';

interface StructuredLogEntry {
    timestamp: string;
    level: string;
    context: string;
    message: string;
    correlationId?: string;
    whatsappAudioId?: string;
    trace?: string;
}

@Injectable()
export class StructuredLoggerProvider implements LoggerPort {
    private readonly config: LogLevelConfig;

    constructor(
        @Inject(CORRELATION_CONTEXT_PORT)
        private readonly correlationContext: CorrelationContextPort,
        @Optional()
        @Inject(LOG_LEVEL_CONFIG)
        config?: LogLevelConfig,
    ) {
        this.config = config ?? { default: 'log' };
    }

    log(context: string, message: string): void {
        this.emit('log', context, message);
    }

    warn(context: string, message: string): void {
        this.emit('warn', context, message);
    }

    error(context: string, message: string, trace?: string): void {
        this.emit('error', context, message, trace);
    }

    debug(context: string, message: string): void {
        this.emit('debug', context, message);
    }

    private emit(level: string, context: string, message: string, trace?: string): void {
        const configLevel = resolveLogLevel(this.config, context);
        if (!isLevelEnabled(configLevel, level as any)) {
            return;
        }

        const data = this.correlationContext.get();

        const entry: StructuredLogEntry = {
            timestamp: new Date().toISOString(),
            level: level.toUpperCase(),
            context,
            message,
        };

        if (data?.correlationId) {
            entry.correlationId = data.correlationId;
        }
        if (data?.whatsappAudioId) {
            entry.whatsappAudioId = data.whatsappAudioId;
        }
        if (trace) {
            entry.trace = trace;
        }

        const stream = level === 'error' || level === 'warn' ? process.stderr : process.stdout;
        stream.write(JSON.stringify(entry) + '\n');
    }
}

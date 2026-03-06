import { Module, Global } from '@nestjs/common';
import { StructuredLoggerProvider } from './structured-logger.provider';
import { AsyncLocalStorageCorrelationContextProvider } from './async-local-storage-correlation-context.provider';
import { CORRELATION_CONTEXT_PORT, LOGGER_PORT } from '../../core/ports/tokens';
import { LOG_LEVEL_CONFIG, LogLevelConfig } from './log-level-config';

const DEFAULT_LOG_LEVEL_CONFIG: LogLevelConfig = {
    default: 'log',
};

@Global()
@Module({
    providers: [
        AsyncLocalStorageCorrelationContextProvider,
        StructuredLoggerProvider,
        {
            provide: CORRELATION_CONTEXT_PORT,
            useExisting: AsyncLocalStorageCorrelationContextProvider,
        },
        {
            provide: LOGGER_PORT,
            useExisting: StructuredLoggerProvider,
        },
        {
            provide: LOG_LEVEL_CONFIG,
            useValue: DEFAULT_LOG_LEVEL_CONFIG,
        },
    ],
    exports: [
        CORRELATION_CONTEXT_PORT,
        LOGGER_PORT,
    ],
})
export class LoggerProviderModule { }

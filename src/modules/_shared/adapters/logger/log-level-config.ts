export type LogLevel = 'debug' | 'log' | 'warn' | 'error' | 'none';

export interface LogLevelConfig {
    /** Default log level for all components */
    default: LogLevel;
    /** Per-component log level overrides (component name → level) */
    overrides?: Record<string, LogLevel>;
}

export const LOG_LEVEL_CONFIG = Symbol('LOG_LEVEL_CONFIG');

const LEVEL_PRIORITY: Record<LogLevel, number> = {
    debug: 0,
    log: 1,
    warn: 2,
    error: 3,
    none: 4,
};

export function isLevelEnabled(configLevel: LogLevel, messageLevel: LogLevel): boolean {
    return LEVEL_PRIORITY[messageLevel] >= LEVEL_PRIORITY[configLevel];
}

export function resolveLogLevel(config: LogLevelConfig, context: string): LogLevel {
    return config.overrides?.[context] ?? config.default;
}

export interface LoggerPort {
    log(context: string, message: string): void;
    warn(context: string, message: string): void;
    error(context: string, message: string, trace?: string): void;
    debug(context: string, message: string): void;
}

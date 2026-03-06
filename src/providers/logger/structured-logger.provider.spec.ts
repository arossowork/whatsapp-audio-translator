import { StructuredLoggerProvider } from './structured-logger.provider';
import { CorrelationContextPort, CorrelationData } from '../../core/ports/correlation-context.port';

describe('StructuredLoggerProvider', () => {
    let provider: StructuredLoggerProvider;
    let fakeCorrelationContext: CorrelationContextPort;
    let stdoutSpy: jest.SpyInstance;
    let stderrSpy: jest.SpyInstance;

    beforeEach(() => {
        fakeCorrelationContext = {
            run: jest.fn(),
            get: jest.fn(),
        };

        stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
        stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    function parseLogEntry(): any {
        const call = stdoutSpy.mock.calls[0]?.[0] || stderrSpy.mock.calls[0]?.[0];
        return JSON.parse(call.trim());
    }

    describe('structured JSON output', () => {
        beforeEach(() => {
            provider = new StructuredLoggerProvider(fakeCorrelationContext);
        });

        it('should output a valid JSON log entry to stdout for log level', () => {
            (fakeCorrelationContext.get as jest.Mock).mockReturnValue(undefined);

            provider.log('TestContext', 'Hello world');

            expect(stdoutSpy).toHaveBeenCalledTimes(1);
            const entry = parseLogEntry();
            expect(entry.level).toBe('LOG');
            expect(entry.context).toBe('TestContext');
            expect(entry.message).toBe('Hello world');
            expect(entry.timestamp).toBeDefined();
        });

        it('should include correlationId and whatsappAudioId when context is set', () => {
            const data: CorrelationData = { correlationId: 'cid-abc', whatsappAudioId: 'msg-123' };
            (fakeCorrelationContext.get as jest.Mock).mockReturnValue(data);

            provider.log('TestContext', 'With context');

            const entry = parseLogEntry();
            expect(entry.correlationId).toBe('cid-abc');
            expect(entry.whatsappAudioId).toBe('msg-123');
        });

        it('should omit correlationId fields when context is not set', () => {
            (fakeCorrelationContext.get as jest.Mock).mockReturnValue(undefined);

            provider.log('TestContext', 'No context');

            const entry = parseLogEntry();
            expect(entry.correlationId).toBeUndefined();
            expect(entry.whatsappAudioId).toBeUndefined();
        });

        it('should write error and warn to stderr', () => {
            (fakeCorrelationContext.get as jest.Mock).mockReturnValue(undefined);

            provider.error('TestContext', 'Error msg', 'trace');
            provider.warn('TestContext', 'Warn msg');

            expect(stderrSpy).toHaveBeenCalledTimes(2);
            const errorEntry = JSON.parse(stderrSpy.mock.calls[0][0].trim());
            expect(errorEntry.level).toBe('ERROR');
            expect(errorEntry.trace).toBe('trace');

            const warnEntry = JSON.parse(stderrSpy.mock.calls[1][0].trim());
            expect(warnEntry.level).toBe('WARN');
        });

        it('should write debug to stdout', () => {
            provider = new StructuredLoggerProvider(fakeCorrelationContext, { default: 'debug' });
            (fakeCorrelationContext.get as jest.Mock).mockReturnValue(undefined);

            provider.debug('TestContext', 'Debug msg');

            const entry = parseLogEntry();
            expect(entry.level).toBe('DEBUG');
        });
    });

    describe('log level filtering', () => {
        it('should suppress debug when default level is log', () => {
            provider = new StructuredLoggerProvider(fakeCorrelationContext, { default: 'log' });
            (fakeCorrelationContext.get as jest.Mock).mockReturnValue(undefined);

            provider.debug('TestContext', 'Should be suppressed');

            expect(stdoutSpy).not.toHaveBeenCalled();
        });

        it('should allow log when default level is log', () => {
            provider = new StructuredLoggerProvider(fakeCorrelationContext, { default: 'log' });
            (fakeCorrelationContext.get as jest.Mock).mockReturnValue(undefined);

            provider.log('TestContext', 'Should pass');

            expect(stdoutSpy).toHaveBeenCalledTimes(1);
        });

        it('should use per-component override when configured', () => {
            provider = new StructuredLoggerProvider(fakeCorrelationContext, {
                default: 'warn',
                overrides: { 'VerboseComponent': 'debug' },
            });
            (fakeCorrelationContext.get as jest.Mock).mockReturnValue(undefined);

            provider.debug('VerboseComponent', 'Should pass due to override');
            provider.debug('OtherComponent', 'Should be suppressed');

            expect(stdoutSpy).toHaveBeenCalledTimes(1);
            const entry = parseLogEntry();
            expect(entry.context).toBe('VerboseComponent');
        });

        it('should suppress all output when level is none', () => {
            provider = new StructuredLoggerProvider(fakeCorrelationContext, { default: 'none' });
            (fakeCorrelationContext.get as jest.Mock).mockReturnValue(undefined);

            provider.log('TestContext', 'Suppressed');
            provider.error('TestContext', 'Suppressed');

            expect(stdoutSpy).not.toHaveBeenCalled();
            expect(stderrSpy).not.toHaveBeenCalled();
        });
    });
});

import { AsyncLocalStorageCorrelationContextProvider } from './async-local-storage-correlation-context.provider';
import { CorrelationData } from '../../../core/ports/correlation-context.port';

describe('AsyncLocalStorageCorrelationContextProvider', () => {
    let provider: AsyncLocalStorageCorrelationContextProvider;

    beforeEach(() => {
        provider = new AsyncLocalStorageCorrelationContextProvider();
    });

    describe('run', () => {
        it('should make correlation data available via get() inside the callback', () => {
            const data: CorrelationData = { correlationId: 'cid-123', whatsappAudioId: 'msg-456' };

            provider.run(data, () => {
                expect(provider.get()).toEqual(data);
            });
        });

        it('should return the value produced by the callback', () => {
            const data: CorrelationData = { correlationId: 'cid-123' };

            const result = provider.run(data, () => 42);

            expect(result).toBe(42);
        });

        it('should return undefined from get() outside of any run scope', () => {
            expect(provider.get()).toBeUndefined();
        });

        it('should support nested runs, with inner overriding outer', () => {
            const outer: CorrelationData = { correlationId: 'outer' };
            const inner: CorrelationData = { correlationId: 'inner' };

            provider.run(outer, () => {
                expect(provider.get()?.correlationId).toBe('outer');

                provider.run(inner, () => {
                    expect(provider.get()?.correlationId).toBe('inner');
                });

                expect(provider.get()?.correlationId).toBe('outer');
            });
        });
    });
});

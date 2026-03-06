import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { CorrelationContextPort, CorrelationData } from '../../core/ports/correlation-context.port';

@Injectable()
export class AsyncLocalStorageCorrelationContextProvider implements CorrelationContextPort {
    private readonly storage = new AsyncLocalStorage<CorrelationData>();

    run<T>(data: CorrelationData, fn: () => T): T {
        return this.storage.run(data, fn);
    }

    get(): CorrelationData | undefined {
        return this.storage.getStore();
    }
}

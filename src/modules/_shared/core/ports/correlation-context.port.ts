export interface CorrelationData {
    correlationId: string;
    whatsappAudioId?: string;
}

export interface CorrelationContextPort {
    run<T>(data: CorrelationData, fn: () => T): T;
    get(): CorrelationData | undefined;
}

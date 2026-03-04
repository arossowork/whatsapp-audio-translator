import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DaprClient, DaprServer } from '@dapr/dapr';

@Injectable()
export class DaprService implements OnModuleInit, OnModuleDestroy {
    public readonly client: DaprClient;
    public readonly server: DaprServer;

    constructor() {
        const daprHost = process.env.DAPR_HOST || '127.0.0.1';
        const daprPort = process.env.DAPR_HTTP_PORT || '3500';
        const serverHost = process.env.SERVER_HOST || '127.0.0.1';
        const serverPort = process.env.APP_PORT || '3000';

        this.client = new DaprClient({ daprHost, daprPort });
        // DaprServer needs to listen to requests from the Dapr sidecar
        this.server = new DaprServer({
            serverHost,
            serverPort,
            clientOptions: {
                daprHost,
                daprPort,
            }
        });
    }

    async onModuleInit() {
        await this.server.start();
    }

    async onModuleDestroy() {
        await this.server.stop();
    }
}

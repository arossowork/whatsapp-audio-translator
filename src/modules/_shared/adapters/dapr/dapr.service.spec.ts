import { Test, TestingModule } from '@nestjs/testing';
import { DaprService } from './dapr.service';

describe('DaprService', () => {
    let service: DaprService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DaprService],
        }).compile();

        service = module.get<DaprService>(DaprService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should initialize DaprClient', () => {
        expect(service.client).toBeDefined();
    });

    it('should initialize DaprServer', () => {
        expect(service.server).toBeDefined();
    });
});

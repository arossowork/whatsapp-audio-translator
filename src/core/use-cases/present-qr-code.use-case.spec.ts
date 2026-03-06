import { PresentQrCodeUseCase } from './present-qr-code.use-case';
import { QrCodeDisplayPort } from '../ports/qr-code-display.port';
import { LoggerPort } from '../ports/logger.port';
import { QrCode } from '../domain/qr-code.entity';

describe('PresentQrCodeUseCase', () => {
    let useCase: PresentQrCodeUseCase;
    let fakeDisplay: QrCodeDisplayPort;
    let fakeLogger: LoggerPort;

    beforeEach(() => {
        fakeDisplay = {
            display: jest.fn(),
        };
        fakeLogger = {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
        };
        useCase = new PresentQrCodeUseCase(fakeDisplay, fakeLogger);
    });

    it('should call display on the port', async () => {
        const qrCode = new QrCode('some-qr-data');
        await useCase.execute(qrCode);

        expect(fakeDisplay.display).toHaveBeenCalledWith(qrCode);
    });

    it('should log when presenting a QR code', async () => {
        const qrCode = new QrCode('some-qr-data');
        await useCase.execute(qrCode);

        expect(fakeLogger.log).toHaveBeenCalledWith(
            'PresentQrCodeUseCase',
            expect.stringContaining('Presenting QR code'),
        );
    });
});

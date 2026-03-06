import { PresentQrCodeUseCase } from './present-qr-code.use-case';
import { QrCodeDisplayPort } from '../ports/qr-code-display.port';
import { QrCode } from '../domain/qr-code.entity';

describe('PresentQrCodeUseCase', () => {
    let useCase: PresentQrCodeUseCase;
    let fakeDisplayPort: jest.Mocked<QrCodeDisplayPort>;

    beforeEach(() => {
        // Simple in-memory fake according to testing strategy
        fakeDisplayPort = {
            display: jest.fn(),
        };
        useCase = new PresentQrCodeUseCase(fakeDisplayPort);
    });

    it('should call the display port with the qr code', () => {
        const qrCode = new QrCode('123456');

        useCase.execute(qrCode);

        expect(fakeDisplayPort.display).toHaveBeenCalledTimes(1);
        expect(fakeDisplayPort.display).toHaveBeenCalledWith(qrCode);
    });
});

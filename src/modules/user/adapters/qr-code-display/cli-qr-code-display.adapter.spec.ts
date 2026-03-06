import { CliQrCodeDisplayAdapter } from './cli-qr-code-display.adapter';
import { QrCode } from '../../core/domain/qr-code.entity';
import * as qrcode from 'qrcode-terminal';

jest.mock('qrcode-terminal', () => ({
    generate: jest.fn(),
}));

describe('CliQrCodeDisplayAdapter', () => {
    let adapter: CliQrCodeDisplayAdapter;

    beforeEach(() => {
        jest.clearAllMocks();
        adapter = new CliQrCodeDisplayAdapter();
    });

    it('should generate a QR code in the terminal when a qr code is displayed', async () => {
        const testQrValue = 'test-qr-code';
        const qrCode = new QrCode(testQrValue);

        await adapter.display(qrCode);

        expect(qrcode.generate).toHaveBeenCalledTimes(1);
        expect(qrcode.generate).toHaveBeenCalledWith(testQrValue, { small: true });
    });
});

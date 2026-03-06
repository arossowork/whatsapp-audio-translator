import { QrCode } from './qr-code.entity';

describe('QrCode Entity', () => {
    it('should create a valid QrCode instance', () => {
        const value = '1@test-qr-data';
        const qrCode = new QrCode(value);
        expect(qrCode).toBeInstanceOf(QrCode);
        expect(qrCode.value).toBe(value);
        expect(qrCode.createdAt).toBeInstanceOf(Date);
    });

    it('should throw an error if the value is empty', () => {
        expect(() => new QrCode('')).toThrow('QR code value cannot be empty');
    });
});

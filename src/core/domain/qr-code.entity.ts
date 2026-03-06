export class QrCode {
    public readonly createdAt: Date;

    constructor(
        public readonly value: string,
        createdAt?: Date,
    ) {
        if (!value || value.trim() === '') {
            throw new Error('QR code value cannot be empty');
        }
        this.createdAt = createdAt || new Date();
    }
}

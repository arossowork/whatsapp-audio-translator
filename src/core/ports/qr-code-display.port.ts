import { QrCode } from '../domain/qr-code.entity';

export interface QrCodeDisplayPort {
    display(qrCode: QrCode): void | Promise<void>;
}

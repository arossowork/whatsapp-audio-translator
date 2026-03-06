import { Injectable, Logger } from '@nestjs/common';
import { QrCodeDisplayPort } from '../../core/ports/qr-code-display.port';
import { QrCode } from '../../core/domain/qr-code.entity';
import * as qrcode from 'qrcode-terminal';

@Injectable()
export class CliQrCodeDisplayAdapter implements QrCodeDisplayPort {
    private readonly logger = new Logger(CliQrCodeDisplayAdapter.name);

    display(qrCode: QrCode): void {
        this.logger.log('Scan this QR code to continue:');
        qrcode.generate(qrCode.value, { small: true });
    }
}

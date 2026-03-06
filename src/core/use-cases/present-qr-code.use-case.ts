import { Injectable, Inject } from '@nestjs/common';
import { QrCode } from '../domain/qr-code.entity';
import type { QrCodeDisplayPort } from '../ports/qr-code-display.port';
import { QR_CODE_DISPLAY_PORT } from '../ports/tokens';

@Injectable()
export class PresentQrCodeUseCase {
    constructor(
        @Inject(QR_CODE_DISPLAY_PORT)
        private readonly qrCodeDisplay: QrCodeDisplayPort,
    ) { }

    async execute(qrCode: QrCode): Promise<void> {
        await this.qrCodeDisplay.display(qrCode);
    }
}

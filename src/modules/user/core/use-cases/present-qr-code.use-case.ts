import { Injectable, Inject } from '@nestjs/common';
import { QrCode } from '../domain/qr-code.entity';
import type { QrCodeDisplayPort } from '../ports/qr-code-display.port';
import type { LoggerPort } from '../../../_shared/core/ports/logger.port';
import { QR_CODE_DISPLAY_PORT, LOGGER_PORT } from '../../../_shared/core/ports/tokens';

@Injectable()
export class PresentQrCodeUseCase {
    constructor(
        @Inject(QR_CODE_DISPLAY_PORT)
        private readonly qrCodeDisplay: QrCodeDisplayPort,
        @Inject(LOGGER_PORT)
        private readonly logger: LoggerPort,
    ) { }

    async execute(qrCode: QrCode): Promise<void> {
        this.logger.log('PresentQrCodeUseCase', 'Presenting QR code');
        await this.qrCodeDisplay.display(qrCode);
    }
}

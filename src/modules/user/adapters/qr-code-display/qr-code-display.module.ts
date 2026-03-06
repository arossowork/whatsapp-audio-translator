import { Module } from '@nestjs/common';
import { CliQrCodeDisplayAdapter } from './cli-qr-code-display.adapter';
import { QR_CODE_DISPLAY_PORT } from '../../../_shared/core/ports/tokens';

@Module({
    providers: [
        {
            provide: QR_CODE_DISPLAY_PORT,
            useClass: CliQrCodeDisplayAdapter,
        },
    ],
    exports: [
        QR_CODE_DISPLAY_PORT,
    ],
})
export class QrCodeDisplayModule { }

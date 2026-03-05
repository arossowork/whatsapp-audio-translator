import { Module } from '@nestjs/common';
import { GlobalPortModule } from './global-port.module';

/**
 * AppModule composes all global wiring modules.
 * No adapter imports another adapter directly here or anywhere — Rule 2.
 */
@Module({
  imports: [GlobalPortModule],
})
export class AppModule { }

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmsController } from './sms.controller';
import { SmsService } from './sms.service';
import { MnotifyProvider } from './providers/mnotify.provider';

@Module({
  controllers: [SmsController],
  providers: [
    {
      provide: 'MnotifyProvider',
      useClass: MnotifyProvider,
    },
    SmsService,
    ConfigService,
  ],
})
export class SmsModule {}

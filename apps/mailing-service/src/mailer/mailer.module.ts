import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { MailerController } from './mailer.controller';
import { ZohoProvider } from './providers/zoho.provider';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [MailerController],
  providers: [
    {
      provide: 'ZohoProvider',
      useClass: ZohoProvider,
    },
    MailerService,
    ConfigService,
  ],
})
export class MailerModule {}

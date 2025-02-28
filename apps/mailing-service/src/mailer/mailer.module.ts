import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { MailerController } from './mailer.controller';
import { ZohoProvider } from './providers/zoho.provider';
import { ConfigService } from '@nestjs/config';
import { GmailProvider } from './providers/gmail.provider';

@Module({
  controllers: [MailerController],
  providers: [
    {
      provide: 'ZohoProvider',
      useClass: ZohoProvider,
    },
    {
      provide: 'GmailProvider',
      useClass: GmailProvider,
    },
    MailerService,
    ConfigService,
  ],
})
export class MailerModule {}

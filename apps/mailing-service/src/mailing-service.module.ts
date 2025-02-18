import { Module } from '@nestjs/common';
import { MailingServiceController } from './mailing-service.controller';
import { MailingServiceService } from './mailing-service.service';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [MailerModule],
  controllers: [MailingServiceController],
  providers: [MailingServiceService],
})
export class MailingServiceModule {}

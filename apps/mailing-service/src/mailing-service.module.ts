import { Module } from '@nestjs/common';
import { MailingServiceController } from './mailing-service.controller';
import { MailingServiceService } from './mailing-service.service';

@Module({
  imports: [],
  controllers: [MailingServiceController],
  providers: [MailingServiceService],
})
export class MailingServiceModule {}

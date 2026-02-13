import { Module } from '@nestjs/common';
import { MailingServiceController } from './mailing-service.controller';
import { MailingServiceService } from './mailing-service.service';
import { MailerModule } from './mailer/mailer.module';
import { ConfigModule} from '@nestjs/config';

@Module({
  imports: [MailerModule, ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: './apps/mailing-service/.env',
  })
  ],
  controllers: [MailingServiceController],
  providers: [MailingServiceService],
})
export class MailingServiceModule {}

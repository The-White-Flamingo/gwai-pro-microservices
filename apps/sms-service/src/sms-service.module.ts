import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SmsModule } from './sms/sms.module';
import { SmsServiceController } from './sms-service.controller';
import { SmsServiceService } from './sms-service.service';

@Module({
  imports: [
    SmsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/sms-service/.env',
    }),
  ],
  controllers: [SmsServiceController],
  providers: [SmsServiceService],
})
export class SmsServiceModule {}

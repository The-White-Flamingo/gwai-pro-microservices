import { Module } from '@nestjs/common';
import { WaitlistServiceController } from './app.controller';
import { WaitlistServiceService } from './app.service';
import { WaitlistModule } from './waitlist/waitlist.module';

@Module({
  imports: [WaitlistModule],
  controllers: [WaitlistServiceController],
  providers: [WaitlistServiceService],
})
export class WaitlistServiceModule { }

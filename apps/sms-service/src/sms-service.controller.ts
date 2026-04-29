import { Controller, Get } from '@nestjs/common';
import { SmsServiceService } from './sms-service.service';

@Controller()
export class SmsServiceController {
  constructor(private readonly smsServiceService: SmsServiceService) {}

  @Get()
  getHello(): string {
    return this.smsServiceService.getHello();
  }
}

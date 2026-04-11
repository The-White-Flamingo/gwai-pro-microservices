import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateSmsDto } from '@app/shared';
import { SmsService } from './sms.service';

@Controller()
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @MessagePattern('sms.send')
  create(@Payload() createSmsDto: CreateSmsDto) {
    return this.smsService.create(createSmsDto);
  }
}

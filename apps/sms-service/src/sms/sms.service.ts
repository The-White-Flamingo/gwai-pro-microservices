import { Inject, Injectable } from '@nestjs/common';
import { CreateSmsDto } from '@app/shared';
import { SmsProvider } from './interfaces/sms-provider.interface';

@Injectable()
export class SmsService {
  constructor(
    @Inject('MnotifyProvider') private readonly smsProvider: SmsProvider,
  ) {}

  create(createSmsDto: CreateSmsDto) {
    return this.smsProvider.sendSms(createSmsDto);
  }
}

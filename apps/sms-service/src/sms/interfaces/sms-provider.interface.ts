import { CreateSmsDto } from '@app/shared';

export interface SmsProvider {
  sendSms(createSmsDto: CreateSmsDto): Promise<unknown>;
}

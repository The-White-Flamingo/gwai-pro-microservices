import { Inject, Injectable } from '@nestjs/common';
import { CreateMailerDto } from '@app/shared';
import { EmailProvider } from './interfaces/email-provider.interface';

@Injectable()
export class MailerService {
  constructor(@Inject('GmailProvider') private readonly zohoProvider: EmailProvider,) {}

  create(createMailerDto: CreateMailerDto) {
    return this.zohoProvider.sendEmail(createMailerDto);
  }
}

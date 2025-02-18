import { Injectable } from '@nestjs/common';

@Injectable()
export class MailingServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class SmsServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}

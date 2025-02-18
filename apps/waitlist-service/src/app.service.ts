import { Injectable } from '@nestjs/common';

@Injectable()
export class WaitlistServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}

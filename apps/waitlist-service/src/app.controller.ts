import { Controller, Get } from '@nestjs/common';
import { WaitlistServiceService } from './app.service';

@Controller()
export class WaitlistServiceController {
  constructor(private readonly waitlistServiceService: WaitlistServiceService) { }

  @Get()
  getHello(): string {
    return this.waitlistServiceService.getHello();
  }
}

import { Controller, Get } from '@nestjs/common';
import { MailingServiceService } from './mailing-service.service';

@Controller()
export class MailingServiceController {
  constructor(private readonly mailingServiceService: MailingServiceService) {}

  @Get()
  getHello(): string {
    return this.mailingServiceService.getHello();
  }
}

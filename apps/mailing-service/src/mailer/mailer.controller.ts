import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MailerService } from './mailer.service';
import { CreateMailerDto } from '@app/shared';

@Controller()
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @MessagePattern('mailer.send')
  create(@Payload() createMailerDto: CreateMailerDto) {
    return this.mailerService.create(createMailerDto);
  }
}

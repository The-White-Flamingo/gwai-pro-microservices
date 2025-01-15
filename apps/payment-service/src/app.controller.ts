import { Controller, Get } from '@nestjs/common';
import { PaymentServiceService } from './app.service';

@Controller()
export class PaymentServiceController {
  constructor(private readonly paymentServiceService: PaymentServiceService) {}

  @Get()
  getHello(): string {
    return this.paymentServiceService.getHello();
  }
}

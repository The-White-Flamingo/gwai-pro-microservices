import { Controller } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import {
  CreatePaymentDto,
  PaystackWebhookDto,
  UpdatePaymentDto,
  VerifyPaymentDto,
} from '@app/payments';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @MessagePattern('payments.findAll')
  findAll() {
    return this.paymentsService.findAll();
  }

  @MessagePattern('payments.findOne')
  findOne(@Payload('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @MessagePattern('payments.update')
  update(
    @Payload('id') id: string,
    @Payload() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @MessagePattern('payments.initialize')
  initialize(@Payload() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.initialize(createPaymentDto);
  }

  @MessagePattern('payments.verify')
  verify(@Payload() verifyPaymentDto: VerifyPaymentDto) {
    return this.paymentsService.verify(verifyPaymentDto);
  }

  @MessagePattern('payments.webhook')
  webhook(@Payload() paystackWebhookDto: PaystackWebhookDto) {
    return this.paymentsService.webhook(paystackWebhookDto);
  }
}

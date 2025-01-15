import { ActiveUserData } from '@app/iam';
import {
  CreatePaymentDto,
  UpdatePaymentDto,
  VerifyPaymentDto,
} from '@app/payments';
import { PAYMENT_SERVICE } from '@app/shared';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class PaymentsService {
  constructor(@Inject(PAYMENT_SERVICE) private readonly client: ClientProxy) {}

  async findAll() {
    try {
      const payments = await lastValueFrom(
        this.client.send('payments.findAll', {}),
      );
      return payments;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      const payment = await lastValueFrom(
        this.client.send('payments.findOne', { id }),
      );

      return payment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    try {
      const payment = await lastValueFrom(
        this.client.send('payments.update', {
          id,
          ...updatePaymentDto,
        }),
      );

      return payment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  async initialize(createPaymentDto: CreatePaymentDto, user: ActiveUserData) {
    try {
      const payment = await lastValueFrom(
        this.client.send('payments.initialize', {
          ...createPaymentDto,
        }),
      );

      return payment;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async verify(verifyPaymentDto: VerifyPaymentDto) {
    try {
      const payment = await lastValueFrom(
        this.client.send('payments.verify', {
          reference: verifyPaymentDto.reference,
        }),
      );

      return payment;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async webhook(payload: any) {
    try {
      const payment = await lastValueFrom(
        this.client.send('payments.webhook', payload),
      );

      return payment;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}

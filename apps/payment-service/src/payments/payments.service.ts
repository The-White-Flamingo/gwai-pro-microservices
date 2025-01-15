import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { PaystackService } from './paystack/paystack.service';
import { PaymentStatus } from './enums/payment-status.enum';
import { ActiveUserData } from '@app/iam';
import {
  CreatePaymentDto,
  UpdatePaymentDto,
  VerifyPaymentDto,
} from '@app/payments';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly paystackService: PaystackService,
  ) {}

  async findAll() {
    try {
      const payments = await this.paymentRepository.find({
        relations: ['request', 'user'],
      });

      return {
        status: true,
        message: 'Payments retrieved successfully',
        data: payments,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      const payment = await this.paymentRepository.findOne({
        where: {
          id,
        },
        relations: ['request', 'user'],
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      return {
        status: true,
        message: 'Payment retrieved successfully',
        data: payment,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    try {
      const payment = await this.paymentRepository.findOneBy({ id });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      await this.paymentRepository.update(id, {
        ...updatePaymentDto,
      });

      return {
        status: true,
        message: 'Payment updated successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  async initialize(createPaymentDto: CreatePaymentDto) {
    try {
      const paystackData = await this.paystackService.initializePayment(
        createPaymentDto.email,
        createPaymentDto.amount,
      );

      const payment = this.paymentRepository.create({
        ...createPaymentDto,
        reference: paystackData.reference,
        paymentLink: paystackData.authorization_url,
      });

      await this.paymentRepository.save(payment);

      return {
        status: true,
        message: 'Payment initialized successfully',
        data: paystackData,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async verify(verifyPaymentDto: VerifyPaymentDto) {
    try {
      const paystackData = await this.paystackService.verifyPayment(
        verifyPaymentDto.reference,
      );

      const payment = await this.paymentRepository.findOne({
        where: { reference: verifyPaymentDto.reference },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      await this.paymentRepository.update(payment.id, {
        status:
          paystackData.status === 'success'
            ? PaymentStatus.Completed
            : PaymentStatus.Failed,
      });

      return {
        status: true,
        message: 'Payment verified successfully',
        data: payment,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async webhook(payload: any) {
    try {
      const result = await this.paystackService.handleWebhook(payload);

      if (result.status) {
        const payment = await this.paymentRepository.findOne({
          where: { reference: result.reference },
        });

        if (!payment) {
          throw new NotFoundException('Payment not found');
        }

        await this.paymentRepository.update(payment.id, {
          status: PaymentStatus.Completed,
        });
      }

      return {
        status: true,
        message: 'Webhook handled successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}

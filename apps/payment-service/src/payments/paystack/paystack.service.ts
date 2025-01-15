import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PaystackService {
  private readonly paystackBaseUrl = process.env.PAYSTACK_BASE_URL;
  private readonly paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

  async initializePayment(email: string, amount: number) {
    try {
      const response = await axios.post(
        `${this.paystackBaseUrl}/transaction/initialize`,
        {
          email,
          amount: amount * 100,
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
          },
        },
      );

      if (response.data.status !== true) {
        throw new BadRequestException('Payment initialization failed');
      }

      return response.data.data;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async verifyPayment(reference: string) {
    try {
      const response = await axios.get(
        `${this.paystackBaseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
          },
        },
      );

      if (response.data.status !== true) {
        throw new BadRequestException('Payment verification failed');
      }

      return response.data.data;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async handleWebhook(payload: any) {
    try {
      const { event, data } = payload;

      if (event === 'charge.success') {
        return {
          status: true,
          reference: data.reference,
          message: 'Payment successful',
        };
      }

      return {
        status: false,
        message: 'Unhandled event',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}

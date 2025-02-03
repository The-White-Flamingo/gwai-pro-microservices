import { PaystackWebhookDataType } from '../types/paystack-webhook-data.type';

export class PaystackWebhookDto {
  event: string;
  data: PaystackWebhookDataType;
}

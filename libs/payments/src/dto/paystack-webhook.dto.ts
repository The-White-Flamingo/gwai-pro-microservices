import { PaystackWebhookDataType } from '../../../../apps/payment-service/src/payments/types/paystack-webhook-data.type';

export class PaystackWebhookDto {
  event: string;
  data: PaystackWebhookDataType;
}

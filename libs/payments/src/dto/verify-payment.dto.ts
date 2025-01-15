import { IsNotEmpty } from 'class-validator';

export class VerifyPaymentDto {
  @IsNotEmpty()
  reference: string;
}

import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import * as request from 'supertest';

export class CreatePaymentDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  amount: number;

  //   @IsOptional()
  //   callbackUrl: string;
}

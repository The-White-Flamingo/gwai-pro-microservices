import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStudioDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  rate: string;

  @IsArray()
  @IsString({ each: true })
  services: string[];

  @IsArray()
  @IsString({ each: true })
  equipment: string[];

  @IsOptional()
  @IsString()
  profilePicturePath?: string;

  @IsOptional()
  @IsString()
  coverVideoPath?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsIn(['bank', 'momo'])
  paymentMethodType?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  bankAccountName?: string;

  @IsOptional()
  @IsString()
  mobileMoneyNetworkProvider?: string;

  @IsOptional()
  @IsString()
  mobileMoneyPhoneNumber?: string;

  @IsOptional()
  @IsString()
  mobileMoneyAccountName?: string;
}

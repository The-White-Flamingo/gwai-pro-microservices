import { IsEnum, IsNotEmpty } from 'class-validator';
import { Service } from '../enums/service.enum';
import { SignUpDto } from '../../../iam/authentication/dto/sign-up.dto';

export class CreateStudioDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  contact: string;

  @IsNotEmpty()
  location: string;

  @IsNotEmpty()
  @IsEnum(Service, { each: true })
  services: Service[];
}

// export class CreateBookingDto {}
// libs/bookings/src/dto/create-booking.dto.ts
import { IsNotEmpty, IsString, IsEnum, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsString()
  userId: string;  // Client's User ID

  @IsNotEmpty()
  @IsString()
  providerId: string;  // Musician.id or Studio.id (entity ID, not User ID)

  @IsNotEmpty()
  @IsEnum(['musician', 'studio'])
  providerType: string;  // 'musician' or 'studio'

  @IsNotEmpty()
  @IsString()
  serviceType: string;  // Type of service

  @IsNotEmpty()
  @IsDateString()
  date: Date;

  @IsNotEmpty()
  @IsString()
  startTime: string;

  @IsNotEmpty()
  @IsString()
  endTime: string;
}

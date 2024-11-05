import { IsNotEmpty, IsEnum } from 'class-validator';
import { Genre } from '../../enums/genre.enum';
import { Interest } from '../../enums/interest.enum';

export class CreateClientDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  contact: string;

  @IsNotEmpty()
  dateOfBirth: Date;

  @IsNotEmpty()
  @IsEnum(Genre, { each: true })
  genres: Genre[];

  @IsNotEmpty()
  @IsEnum(Interest, { each: true })
  interests: Interest[];
}

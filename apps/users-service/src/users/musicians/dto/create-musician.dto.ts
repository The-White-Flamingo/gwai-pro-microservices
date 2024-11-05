import { IsEnum, IsNotEmpty } from 'class-validator';
import { Genre } from '../../enums/genre.enum';
import { Interest } from '../../enums/interest.enum';
import { SignUpDto } from '../../../iam/authentication/dto/sign-up.dto';

export class CreateMusicianDto {
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

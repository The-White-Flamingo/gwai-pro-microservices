import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Genre } from '../../enums/genre.enum';
import { Interest } from '../../enums/interest.enum';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  contact: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column('simple-array', { nullable: true })
  genres: Genre[];

  @Column('simple-array', { nullable: true })
  interests: Interest[];

  @OneToOne(() => User)
  user: User;
}

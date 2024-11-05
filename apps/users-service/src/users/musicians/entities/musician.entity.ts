import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../entities/user.entity';
import { Genre } from '../../enums/genre.enum';
import { Interest } from '../../enums/interest.enum';

@Entity('musicians')
export class Musician {
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User)
  user: User;
}

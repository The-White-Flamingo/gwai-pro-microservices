import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../entities/user.entity';

@Entity('api-keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  key: string;

  @Column()
  uuid: string;

  @ManyToOne(() => User, (user) => user.apiKeys)
  user: User;

  // @Column()
  // scopes: Scope[];
}

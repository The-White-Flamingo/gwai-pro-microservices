// apps/users-service/src/users/admins/entities/admin-role.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('admin_roles')
export class AdminRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('simple-array', { nullable: true })
  permissions: string[];

  // Derived field — count of admins assigned this role label
  // Stored as a virtual count, calculated on fetch
  @Column({ default: 0 })
  users: number;

  @CreateDateColumn()
  createdAt: Date;
}
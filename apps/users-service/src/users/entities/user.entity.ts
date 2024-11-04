import { Column, Entity, JoinTable, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "../enums/role.enum";
import { ApiKey } from "../api-keys/entities/api-key.entity";

@Entity('users')
export class User { 
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique: true})
    email: string;

    @Column({ nullable: true })
    password: string;

    @Column('enum', { enum: Role, default: Role.Regular })
    role: Role;

    @Column({ nullable: true })
    googleId: string;

    @JoinTable()
    @OneToMany(() => ApiKey, (apiKey) => apiKey.user)
    apiKeys: ApiKey[];
}

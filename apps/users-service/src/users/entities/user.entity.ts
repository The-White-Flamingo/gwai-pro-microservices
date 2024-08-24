import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "../enums/role.enum";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    password: string;

    @Column('enum', { enum: Role, default: Role.Regular })
    role: Role;

    @Column({ default: false })
    isTfaEnabled: boolean;

    @Column({ nullable: true })
    tfaSecret: string;

    @Column({ nullable: true })
    googleId: string;
}

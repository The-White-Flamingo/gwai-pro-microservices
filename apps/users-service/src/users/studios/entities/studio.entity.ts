import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../entities/user.entity";
import { Service } from "../enums/service.enum";

@Entity('studios')
export class Studio {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    contact: string;

    @Column()
    location: string;

    @Column()
    dateOfBirth: Date;
    
    @Column('simple-array', { nullable: true })
    services: Service[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToOne(() => User)
    user: User;
}

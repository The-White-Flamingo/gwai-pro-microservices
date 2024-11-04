import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../entities/user.entity";
import { Genre } from "../../enums/genre.enum";
import { Interest } from "../../enums/interest.enum";

@Entity('clients')
export class Client { 
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    contact: string;

    @Column()
    location: string;

    @Column()
    dateOfBirth: Date;

    @Column('simple-array', { nullable: true })
    genres: Genre[];

    @Column('simple-array', { nullable: true })
    interests: Interest[];

    @OneToOne(() => User)
    user: User;
}

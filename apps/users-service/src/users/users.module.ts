import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ApiKey } from './api-keys/entities/api-key.entity';
import { Client } from './clients/entities/client.entity';
import { Musician } from './musicians/entities/musician.entity';
import { Studio } from './studios/entities/studio.entity';
import { Admin } from './admins/entities/admin.entity';
import { MusiciansModule } from './musicians/musicians.module';
import { StudiosModule } from './studios/studios.module';
import { ClientsModule } from './clients/clients.module';
import { AdminsModule } from './admins/admins.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ApiKey, Client, Musician, Studio, Admin]),
    MusiciansModule,
    StudiosModule,
    ClientsModule,
    AdminsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ApiKey } from './api-keys/entities/api-key.entity';
import { MusiciansModule } from './musicians/musicians.module';
import { StudiosModule } from './studios/studios.module';
import { ClientsModule } from './clients/clients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ApiKey]),
    MusiciansModule,
    StudiosModule,
    ClientsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

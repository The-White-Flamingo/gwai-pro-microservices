import { Module } from '@nestjs/common';
import { UsersServiceController } from './users-service.controller';
import { UsersServiceService } from './users-service.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamModule } from './iam/iam.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: +process.env.POSTGRES_PORT,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true,
      synchronize: true,
    }),
    IamModule,
    UsersModule,
  ],
  controllers: [UsersServiceController],
  providers: [UsersServiceService],
})
export class UsersServiceModule {}

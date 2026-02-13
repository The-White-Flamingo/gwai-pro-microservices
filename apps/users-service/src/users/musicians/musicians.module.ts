// apps/users-service/src/users/musicians/musicians.module.ts
import { Module } from '@nestjs/common';
import { MusiciansService } from './musicians.service';
import { MusiciansController } from './musicians.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Musician } from './entities/musician.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Musician])],
  controllers: [MusiciansController],
  providers: [MusiciansService],
})
export class MusiciansModule {}

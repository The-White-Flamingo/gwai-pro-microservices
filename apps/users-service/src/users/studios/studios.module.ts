import { Module } from '@nestjs/common';
import { StudiosService } from './studios.service';
import { StudiosController } from './studios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Studio } from './entities/studio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Studio])],
  controllers: [StudiosController],
  providers: [StudiosService],
})
export class StudiosModule {}

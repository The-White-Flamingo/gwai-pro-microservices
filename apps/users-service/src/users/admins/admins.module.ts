import { Module } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { User } from '../entities/user.entity';
import { HashingService } from '../../iam/hashing/hashing.service';
import { BcryptService } from '../../iam/hashing/bcrypt.service';
import { AdminRole } from './entities/admin-role.entity';
import { SystemSettings } from './entities/system-settings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, User, AdminRole, SystemSettings]),
  ],
  controllers: [AdminsController],
  providers: [
    AdminsService,
    {
      provide: HashingService,
      useClass: BcryptService,
    },
  ],
})
export class AdminsModule {}

import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HashingService } from '../hashing/hashing.service';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../users/enums/role.enum';

const DEFAULT_ADMIN_EMAIL = 'admin@gwaipro.com';
const DEFAULT_ADMIN_PASSWORD = 'admingwai@123!';

@Injectable()
export class AdminSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly hashingService: HashingService,
  ) {}

  async onApplicationBootstrap() {
    const passwordHash = await this.hashingService.hash(DEFAULT_ADMIN_PASSWORD);
    const existingAdmin = await this.usersRepository.findOneBy({
      email: DEFAULT_ADMIN_EMAIL,
    });

    if (existingAdmin) {
      existingAdmin.password = passwordHash;
      existingAdmin.role = Role.Admin;
      await this.usersRepository.save(existingAdmin);
      this.logger.log(
        `Seeded admin credentials refreshed for ${DEFAULT_ADMIN_EMAIL}`,
      );
      return;
    }

    const adminUser = this.usersRepository.create({
      email: DEFAULT_ADMIN_EMAIL,
      password: passwordHash,
      role: Role.Admin,
    });

    await this.usersRepository.save(adminUser);
    this.logger.log(`Seeded admin user created for ${DEFAULT_ADMIN_EMAIL}`);
  }
}

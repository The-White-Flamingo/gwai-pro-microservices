// apps/users-service/src/database/seeds/admin.seed.ts
import { DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Admin } from '../../users/admins/entities/admin.entity';
import { Role } from '../../users/enums/role.enum';
import * as bcrypt from 'bcryptjs';

export async function seedAdmin(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const adminRepository = dataSource.getRepository(Admin);

  // Check if admin user already exists — safe to run on every startup
  const existing = await userRepository.findOneBy({
    email: process.env.ADMIN_EMAIL,
  });

  if (existing) {
    console.log('[Seed] Admin user already exists, skipping.');
    return;
  }

  // Create the User record
  const user = userRepository.create({
    email: process.env.ADMIN_EMAIL,
    password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
    role: Role.Admin,
    isEmailVerified: true, // bypass email verification for seeded admin
  });

  await userRepository.save(user);

  // Create the linked Admin profile record
  const admin = adminRepository.create({
    firstName: process.env.ADMIN_FIRST_NAME || 'Super',
    lastName: process.env.ADMIN_LAST_NAME || 'Admin',
    role: 'Super Admin', // this is the display role label on blog posts
    user,
  });

  await adminRepository.save(admin);

  console.log(`[Seed] Admin created: ${process.env.ADMIN_EMAIL}`);
}
// apps/users-service/src/users/admins/admins.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { User } from '../entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
// import { UpdateNotificationsDto } from './dto/update-notifications.dto';
import { HashingService } from '../../iam/hashing/hashing.service';
import { AdminRole } from './entities/admin-role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InviteStaffDto } from './dto/invite-staff.dto';
import { ConflictException } from '@nestjs/common';
import { Role } from '@app/iam/authorization/enums/role.enum';
// Add to imports:
import { SystemSettings } from './entities/system-settings.entity';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';


@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
    @InjectRepository(AdminRole)
    private readonly adminRoleRepository: Repository<AdminRole>,
    // Add to constructor:
    @InjectRepository(SystemSettings)
    private readonly systemSettingsRepository: Repository<SystemSettings>,
  ) {}

  // ── GET /settings/system ───────────────────────────────────────────────

async getSystemSettings() {
  // Singleton pattern — always only one row
  let settings = await this.systemSettingsRepository.findOne({
    where: {},
    order: { updatedAt: 'ASC' },
  });

  // Auto-create with defaults if it doesn't exist yet
  if (!settings) {
    settings = this.systemSettingsRepository.create();
    await this.systemSettingsRepository.save(settings);
  }

  return this.formatSystemSettings(settings);
}

// ── PATCH /settings/system ─────────────────────────────────────────────

async updateSystemSettings(updateDto: UpdateSystemSettingsDto) {
  let settings = await this.systemSettingsRepository.findOne({
    where: {},
    order: { updatedAt: 'ASC' },
  });

  if (!settings) {
    settings = this.systemSettingsRepository.create();
  }

  // Apply only the fields that were sent
  Object.assign(settings, updateDto);
  await this.systemSettingsRepository.save(settings);

  return {
    status: true,
    message: 'System settings updated successfully.',
    data: this.formatSystemSettings(settings),
  };
}

// ── Private formatter ──────────────────────────────────────────────────

private formatSystemSettings(settings: SystemSettings) {
  return {
    minimumBookingNotice: settings.minimumBookingNotice,
    maximumBookingWindow: settings.maximumBookingWindow,
    musicianCommissionRate: Number(settings.musicianCommissionRate),
    studioCommissionRate: Number(settings.studioCommissionRate),
    freeCancellationUntil: settings.freeCancellationUntil,
    refundPercentageAfter: settings.refundPercentageAfter,
    policyDescription: settings.policyDescription,
    bookingConfirmations: settings.bookingConfirmations,
    bookingChanges: settings.bookingChanges,
    payoutUpdates: settings.payoutUpdates,
    refundRequests: settings.refundRequests,
    paymentFailures: settings.paymentFailures,
    adminNotesComments: settings.adminNotesComments,
  };
}

  // ── GET /settings/profile ──────────────────────────────────────────────

  async getProfile(userId: string) {
    const admin = await this.adminRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!admin) {
      return new NotFoundException('Admin profile not found').getResponse();
    }

    return {
      id: admin.id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role || 'Super Admin',
      email: admin.user.email,
      country: admin.country,
      phone: admin.contact,
      residentialAddress: admin.location,
      postalAddress: admin.postalAddress,
      profilePhoto: admin.profilePhoto,
    };
  }

  // ── PATCH /settings/profile ────────────────────────────────────────────

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const admin = await this.adminRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!admin) {
      return new NotFoundException('Admin profile not found').getResponse();
    }

    // Map DTO fields to entity fields
    if (updateProfileDto.firstName !== undefined)
      admin.firstName = updateProfileDto.firstName;
    if (updateProfileDto.lastName !== undefined)
      admin.lastName = updateProfileDto.lastName;
    if (updateProfileDto.country !== undefined)
      admin.country = updateProfileDto.country;
    if (updateProfileDto.postalAddress !== undefined)
      admin.postalAddress = updateProfileDto.postalAddress;
    if (updateProfileDto.contact !== undefined)
      admin.contact = updateProfileDto.contact;
    if (updateProfileDto.location !== undefined)
      admin.location = updateProfileDto.location;
    if (updateProfileDto.profilePhoto !== undefined)
      admin.profilePhoto = updateProfileDto.profilePhoto;

    await this.adminRepository.save(admin);

    return {
      status: true,
      message: 'Profile updated successfully.',
      data: await this.getProfile(userId),
    };
  }

  // ── POST /settings/profile/photo ───────────────────────────────────────

  async updateProfilePhoto(userId: string, photoUrl: string) {
    const admin = await this.adminRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!admin) {
      return new NotFoundException('Admin profile not found').getResponse();
    }

    admin.profilePhoto = photoUrl;
    await this.adminRepository.save(admin);

    return {
      status: true,
      photoUrl,
    };
  }

  // ── POST /settings/account/change-password ─────────────────────────────

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      return new BadRequestException(
        'New password and confirm password do not match',
      ).getResponse();
    }

    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      return new NotFoundException('User not found').getResponse();
    }

    const isCurrentPasswordValid = await this.hashingService.compare(
      changePasswordDto.currentPassword,
      user.password,
    );
if (!isCurrentPasswordValid) {
      return new BadRequestException(
        'Current password is incorrect',
      ).getResponse();
    }

    user.password = await this.hashingService.hash(changePasswordDto.newPassword);
    await this.userRepository.save(user);

    return {
      status: true,
      message: 'Password changed successfully.',
    };

  }

  // ── GET /settings/admins/roles ─────────────────────────────────────────

async getRoles() {
  const roles = await this.adminRoleRepository.find({
    order: { createdAt: 'DESC' },
  });

  return roles.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description,
    permissions: role.permissions || [],
    permissionsSummary: (role.permissions || []).join(', '),
    users: role.users,
    createdAt: role.createdAt,
  }));
}

// ── POST /settings/admins/roles ────────────────────────────────────────

async createRole(createRoleDto: CreateRoleDto) {
  const existing = await this.adminRoleRepository.findOneBy({
    name: createRoleDto.name,
  });

  if (existing) {
    return new ConflictException(
      `Role "${createRoleDto.name}" already exists`,
    ).getResponse();
  }

  const role = this.adminRoleRepository.create({
    name: createRoleDto.name,
    description:
      createRoleDto.description ||
      'Lorem ipsum dolor sit amet consectetur adipiscing elit.',
    permissions: createRoleDto.permissions || [],
    users: 0,
  });

  await this.adminRoleRepository.save(role);

  return {
    status: true,
    message: 'Role created successfully.',
    data: {
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      permissionsSummary: role.permissions.join(', '),
      users: role.users,
      createdAt: role.createdAt,
    },
  };
}

// ── PATCH /settings/admins/roles/:id ──────────────────────────────────

async updateRole(id: string, updateRoleDto: UpdateRoleDto) {
  const role = await this.adminRoleRepository.findOneBy({ id });

  if (!role) {
    return new NotFoundException('Role not found').getResponse();
  }

  if (updateRoleDto.name !== undefined) role.name = updateRoleDto.name;
  if (updateRoleDto.description !== undefined)
    role.description = updateRoleDto.description;
  if (updateRoleDto.permissions !== undefined)
    role.permissions = updateRoleDto.permissions;

  await this.adminRoleRepository.save(role);

  return {
    id: role.id,
    name: role.name,
    description: role.description,
    permissions: role.permissions,
    permissionsSummary: role.permissions.join(', '),
    users: role.users,
    createdAt: role.createdAt,
  };
}

// ── DELETE /settings/admins/roles/:id ─────────────────────────────────

async deleteRole(id: string) {
  const role = await this.adminRoleRepository.findOneBy({ id });

  if (!role) {
    return new NotFoundException('Role not found').getResponse();
  }

  await this.adminRoleRepository.remove(role);

  return { status: true, message: 'Role deleted successfully.' };
}

// ── POST /settings/admins/invite ───────────────────────────────────────

async inviteStaff(inviteStaffDto: InviteStaffDto, invitedByEmail: string) {
  // Check if user already exists
  const existing = await this.userRepository.findOneBy({
    email: inviteStaffDto.email,
  });

  if (existing) {
    return new ConflictException(
      'A user with this email already exists',
    ).getResponse();
  }

  // Check the role exists
  const role = await this.adminRoleRepository.findOneBy({
    name: inviteStaffDto.role,
  });

  if (!role) {
    return new NotFoundException(
      `Role "${inviteStaffDto.role}" not found`,
    ).getResponse();
  }

  // Generate a temporary password — staff must reset on first login
  const tempPassword = `Temp@${Math.random().toString(36).slice(2, 10)}!`;

  const user = this.userRepository.create({
    email: inviteStaffDto.email,
    password: await this.hashingService.hash(tempPassword),
    role: Role.Admin,
    isEmailVerified: true,
  });

  await this.userRepository.save(user);

  const admin = this.adminRepository.create({
    firstName: inviteStaffDto.firstName,
    lastName: inviteStaffDto.lastName,
    role: inviteStaffDto.role,
    user,
  });

  await this.adminRepository.save(admin);

  // Increment the users count on the role
  role.users = (role.users || 0) + 1;
  await this.adminRoleRepository.save(role);

  return {
    status: true,
    message: `Staff member invited successfully. A temporary password has been sent to ${inviteStaffDto.email}.`,
    // In production, emit an email with the temp password via mailing service
    // For now returning it so you can test locally
    tempPassword,
  };
}

  /**
   * // apps/users-service/src/users/admins/admins.service.ts
// Add these imports at the top
import { AdminRole } from './entities/admin-role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InviteStaffDto } from './dto/invite-staff.dto';
import { ConflictException } from '@nestjs/common';

// Add to constructor:
@InjectRepository(AdminRole)
private readonly adminRoleRepository: Repository<AdminRole>,

// ── GET /settings/admins/roles ─────────────────────────────────────────

async getRoles() {
  const roles = await this.adminRoleRepository.find({
    order: { createdAt: 'DESC' },
  });

  return roles.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description,
    permissions: role.permissions || [],
    permissionsSummary: (role.permissions || []).join(', '),
    users: role.users,
    createdAt: role.createdAt,
  }));
}

// ── POST /settings/admins/roles ────────────────────────────────────────

async createRole(createRoleDto: CreateRoleDto) {
  const existing = await this.adminRoleRepository.findOneBy({
    name: createRoleDto.name,
  });

  if (existing) {
    return new ConflictException(
      Role "${createRoleDto.name}" already exists,
    ).getResponse();
  }

  const role = this.adminRoleRepository.create({
    name: createRoleDto.name,
    description:
      createRoleDto.description ||
      'Lorem ipsum dolor sit amet consectetur adipiscing elit.',
    permissions: createRoleDto.permissions || [],
    users: 0,
  });

  await this.adminRoleRepository.save(role);

  return {
    status: true,
    message: 'Role created successfully.',
    data: {
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      permissionsSummary: role.permissions.join(', '),
      users: role.users,
      createdAt: role.createdAt,
    },
  };
}

// ── PATCH /settings/admins/roles/:id ──────────────────────────────────

async updateRole(id: string, updateRoleDto: UpdateRoleDto) {
  const role = await this.adminRoleRepository.findOneBy({ id });

  if (!role) {
    return new NotFoundException('Role not found').getResponse();
  }

  if (updateRoleDto.name !== undefined) role.name = updateRoleDto.name;
  if (updateRoleDto.description !== undefined)
    role.description = updateRoleDto.description;
  if (updateRoleDto.permissions !== undefined)
    role.permissions = updateRoleDto.permissions;

  await this.adminRoleRepository.save(role);

  return {
    id: role.id,
    name: role.name,
    description: role.description,
    permissions: role.permissions,
    permissionsSummary: role.permissions.join(', '),
    users: role.users,
    createdAt: role.createdAt,
  };
}

// ── DELETE /settings/admins/roles/:id ─────────────────────────────────

async deleteRole(id: string) {
  const role = await this.adminRoleRepository.findOneBy({ id });

  if (!role) {
    return new NotFoundException('Role not found').getResponse();
  }

  await this.adminRoleRepository.remove(role);

  return { status: true, message: 'Role deleted successfully.' };
}

// ── POST /settings/admins/invite ───────────────────────────────────────

async inviteStaff(inviteStaffDto: InviteStaffDto, invitedByEmail: string) {
  // Check if user already exists
  const existing = await this.userRepository.findOneBy({
    email: inviteStaffDto.email,
  });

  if (existing) {
    return new ConflictException(
      'A user with this email already exists',
    ).getResponse();
  }

  // Check the role exists
  const role = await this.adminRoleRepository.findOneBy({
    name: inviteStaffDto.role,
  });

  if (!role) {
    return new NotFoundException(
      Role "${inviteStaffDto.role}" not found,
    ).getResponse();
  }

  // Generate a temporary password — staff must reset on first login
  const tempPassword = Temp@${Math.random().toString(36).slice(2, 10)}!;

  const user = this.userRepository.create({
    email: inviteStaffDto.email,
    password: await this.hashingService.hash(tempPassword),
    role: Role.
   * Admin,
    isEmailVerified: true,
  });

  await this.userRepository.save(user);

  const admin = this.adminRepository.create({
    firstName: inviteStaffDto.firstName,
    lastName: inviteStaffDto.lastName,
    role: inviteStaffDto.role,
    user,
  });

  await this.adminRepository.save(admin);

  // Increment the users count on the role
  role.users = (role.users || 0) + 1;
  await this.adminRoleRepository.save(role);

  return {
    status: true,
    message: Staff member invited successfully. A temporary password has been sent to ${inviteStaffDto.email}.,
    // In production, emit an email with the temp password via mailing service
    // For now returning it so you can test locally
    tempPassword,
  };
}
   */

  // ── PATCH /settings/account/notifications ──────────────────────────────

  // async updateNotifications(
  //   userId: string,
  //   updateNotificationsDto: UpdateNotificationsDto,
  // ) {
  //   const admin = await this.adminRepository.findOne({
  //     where: { user: { id: userId } },
  //   });

  //   if (!admin) {
  //     return new NotFoundException('Admin profile not found').getResponse();
  //   }

  //   if (updateNotificationsDto.inAppNotifications !== undefined)
  //     admin.inAppNotifications = updateNotificationsDto.inAppNotifications;
  //   if (updateNotificationsDto.emailNotifications !== undefined)
  //     admin.emailNotifications = updateNotificationsDto.emailNotifications;

  //   await this.adminRepository.save(admin);

  //   return {
  //     status: true,
  //     message: 'Notification settings updated successfully.',
  //     data: {
  //       inAppNotifications: admin.inAppNotifications,
  //       emailNotifications: admin.emailNotifications,
  //     },
  //   };
  // }

  // ── GET /settings/account/notifications ───────────────────────────────

  // async getNotifications(userId: string) {
  //   const admin = await this.adminRepository.findOne({
  //     where: { user: { id: userId } },
  //   });

  //   if (!admin) {
  //     return new NotFoundException('Admin profile not found').getResponse();
  //   }

  //   return {
  //     inAppNotifications: admin.inAppNotifications,
  //     emailNotifications: admin.emailNotifications,
  //   };
  // }
}
// import { Injectable } from '@nestjs/common';
// import { CreateAdminDto } from './dto/create-admin.dto';
// import { UpdateAdminDto } from './dto/update-admin.dto';

// @Injectable()
// export class AdminsService {
//   create(createAdminDto: CreateAdminDto) {
//     return {
//       status: true,
//       message: 'Admin profile created successfully',
//       data: createAdminDto,
//     };
//   }

//   findAll() {
//     return `This action returns all admins`;
//   }

//   findOne(id: number) {
//     return `This action returns a #${id} admin`;
//   }

//   update(id: number, updateAdminDto: UpdateAdminDto) {
//     return `This action updates a #${id} admin`;
//   }

//   remove(id: number) {
//     return `This action removes a #${id} admin`;
//   }
// }

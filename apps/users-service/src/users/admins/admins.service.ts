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

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
  ) {}

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

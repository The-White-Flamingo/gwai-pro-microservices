import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { HashingService } from '../../iam/hashing/hashing.service';
import { User } from '../entities/user.entity';
import { Role } from '../enums/role.enum';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InviteStaffDto } from './dto/invite-staff.dto';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';
import { Admin } from './entities/admin.entity';
import { AdminRole } from './entities/admin-role.entity';
import { SystemSettings } from './entities/system-settings.entity';

type AdminPayload = Partial<CreateAdminDto & UpdateAdminDto> & {
  userId?: string;
  role?: string;
};

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminsRepository: Repository<Admin>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(AdminRole)
    private readonly adminRolesRepository: Repository<AdminRole>,
    @InjectRepository(SystemSettings)
    private readonly systemSettingsRepository: Repository<SystemSettings>,
    private readonly hashingService: HashingService,
  ) {}

  async create(createAdminDto: CreateAdminDto & { userId: string }) {
    try {
      const normalizedPayload = this.normalizeAdminPayload(createAdminDto);
      const { userId, ...profilePayload } = normalizedPayload;
      const user = await this.usersRepository.findOneBy({ id: userId });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const existingProfile = await this.adminsRepository.findOne({
        where: { user: { id: userId } },
      });

      if (existingProfile) {
        throw new ConflictException('Admin profile already exists');
      }

      await this.ensureUniqueUserPhoneNumber(user.id, profilePayload.phoneNumber);
      await this.ensureAdminRoleExists(profilePayload.adminRoleName);

      if (profilePayload.phoneNumber !== undefined) {
        user.phoneNumber = profilePayload.phoneNumber;
      }
      user.role = Role.Admin;
      await this.usersRepository.save(user);

      const admin = this.adminsRepository.create({
        ...profilePayload,
        role: Role.Admin,
        adminRoleName: profilePayload.adminRoleName ?? 'Admin',
        user,
      });
      const savedAdmin = await this.adminsRepository.save(admin);

      return {
        status: true,
        message: 'Admin profile created successfully',
        data: this.serializeAdmin(savedAdmin, user),
      };
    } catch (error) {
      this.throwAdminError(error);
    }
  }

  async findAll() {
    try {
      const admins = await this.adminsRepository.find({
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });

      return {
        status: true,
        message: 'Admins retrieved successfully',
        data: admins.map((admin) => this.serializeAdmin(admin, admin.user)),
      };
    } catch (error) {
      this.throwAdminError(error);
    }
  }

  async findOne(id: string) {
    try {
      const admin = await this.adminsRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!admin) {
        throw new NotFoundException('Admin profile not found');
      }

      return {
        status: true,
        message: 'Admin profile retrieved successfully',
        data: this.serializeAdmin(admin, admin.user),
      };
    } catch (error) {
      this.throwAdminError(error);
    }
  }

  async getProfile(userId: string) {
    try {
      const admin = await this.findAdminByUserId(userId);

      return {
        status: true,
        message: 'Admin profile retrieved successfully',
        data: this.serializeAdmin(admin, admin.user),
      };
    } catch (error) {
      this.throwAdminError(error);
    }
  }

  async updateProfile(
    updateAdminDto: Partial<UpdateAdminDto> & { userId: string },
  ) {
    try {
      const normalizedPayload = this.normalizeAdminPayload(updateAdminDto);
      const { userId, ...profilePayload } = normalizedPayload;
      const admin = await this.findAdminByUserId(userId);

      await this.ensureUniqueUserPhoneNumber(
        admin.user.id,
        profilePayload.phoneNumber,
      );
      await this.ensureAdminRoleExists(profilePayload.adminRoleName);

      if (profilePayload.phoneNumber !== undefined) {
        admin.user.phoneNumber = profilePayload.phoneNumber;
      }
      admin.user.role = Role.Admin;
      await this.usersRepository.save(admin.user);

      Object.assign(admin, profilePayload);
      admin.role = Role.Admin;
      const updatedAdmin = await this.adminsRepository.save(admin);

      return {
        status: true,
        message: 'Admin profile updated successfully',
        data: this.serializeAdmin(updatedAdmin, admin.user),
      };
    } catch (error) {
      this.throwAdminError(error);
    }
  }

  async getRoles() {
    try {
      const roles = await this.adminRolesRepository.find({
        order: { createdAt: 'DESC' },
      });

      const items = await Promise.all(
        roles.map(async (role) => ({
          id: role.id,
          name: role.name,
          description: role.description,
          permissions: role.permissions ?? [],
          users: await this.adminsRepository.count({
            where: { adminRoleName: role.name },
          }),
          createdAt: role.createdAt,
        })),
      );

      return {
        status: true,
        message: 'Admin roles retrieved successfully',
        data: items,
      };
    } catch (error) {
      this.throwAdminError(error);
    }
  }

  async createRole(createRoleDto: CreateRoleDto) {
    try {
      const existingRole = await this.adminRolesRepository.findOneBy({
        name: createRoleDto.name,
      });

      if (existingRole) {
        throw new ConflictException(
          `Role "${createRoleDto.name}" already exists`,
        );
      }

      const role = this.adminRolesRepository.create({
        name: createRoleDto.name.trim(),
        description: createRoleDto.description?.trim() || null,
        permissions: createRoleDto.permissions?.map((value) => value.trim()),
      });

      const savedRole = await this.adminRolesRepository.save(role);

      return {
        status: true,
        message: 'Admin role created successfully',
        data: {
          id: savedRole.id,
          name: savedRole.name,
          description: savedRole.description,
          permissions: savedRole.permissions ?? [],
          users: 0,
          createdAt: savedRole.createdAt,
        },
      };
    } catch (error) {
      this.throwAdminError(error);
    }
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto) {
    try {
      const role = await this.adminRolesRepository.findOneBy({ id });

      if (!role) {
        throw new NotFoundException('Admin role not found');
      }

      const oldRoleName = role.name;
      const nextRoleName = updateRoleDto.name?.trim();

      if (nextRoleName && nextRoleName !== oldRoleName) {
        const existingRole = await this.adminRolesRepository.findOneBy({
          name: nextRoleName,
        });

        if (existingRole && existingRole.id !== id) {
          throw new ConflictException(`Role "${nextRoleName}" already exists`);
        }
      }

      if (updateRoleDto.name !== undefined) {
        role.name = updateRoleDto.name.trim();
      }
      if (updateRoleDto.description !== undefined) {
        role.description = updateRoleDto.description?.trim() || null;
      }
      if (updateRoleDto.permissions !== undefined) {
        role.permissions = updateRoleDto.permissions.map((value) => value.trim());
      }

      const updatedRole = await this.adminRolesRepository.save(role);

      if (nextRoleName && nextRoleName !== oldRoleName) {
        const adminsUsingRole = await this.adminsRepository.findBy({
          adminRoleName: oldRoleName,
        });

        if (adminsUsingRole.length > 0) {
          for (const admin of adminsUsingRole) {
            admin.adminRoleName = nextRoleName;
          }
          await this.adminsRepository.save(adminsUsingRole);
        }
      }

      return {
        status: true,
        message: 'Admin role updated successfully',
        data: {
          id: updatedRole.id,
          name: updatedRole.name,
          description: updatedRole.description,
          permissions: updatedRole.permissions ?? [],
          users: await this.adminsRepository.count({
            where: { adminRoleName: updatedRole.name },
          }),
          createdAt: updatedRole.createdAt,
        },
      };
    } catch (error) {
      this.throwAdminError(error);
    }
  }

  async deleteRole(id: string) {
    try {
      const role = await this.adminRolesRepository.findOneBy({ id });

      if (!role) {
        throw new NotFoundException('Admin role not found');
      }

      const assignedUsersCount = await this.adminsRepository.count({
        where: { adminRoleName: role.name },
      });

      if (assignedUsersCount > 0) {
        throw new ConflictException(
          'Cannot delete an admin role that is currently assigned to staff',
        );
      }

      await this.adminRolesRepository.remove(role);

      return {
        status: true,
        message: 'Admin role deleted successfully',
      };
    } catch (error) {
      this.throwAdminError(error);
    }
  }

  async inviteStaff(inviteStaffDto: InviteStaffDto, invitedByUserId: string) {
    try {
      await this.findAdminByUserId(invitedByUserId);

      const existingUser = await this.usersRepository.findOneBy({
        email: inviteStaffDto.email.toLowerCase(),
      });

      if (existingUser) {
        throw new ConflictException('A user with this email already exists');
      }

      const role = await this.adminRolesRepository.findOneBy({
        name: inviteStaffDto.role.trim(),
      });

      if (!role) {
        throw new NotFoundException(
          `Admin role "${inviteStaffDto.role}" was not found`,
        );
      }

      const tempPassword = this.generateTemporaryPassword();
      const user = this.usersRepository.create({
        email: inviteStaffDto.email.toLowerCase(),
        password: await this.hashingService.hash(tempPassword),
        role: Role.Admin,
      });
      const savedUser = await this.usersRepository.save(user);

      const admin = this.adminsRepository.create({
        firstName: inviteStaffDto.firstName.trim(),
        lastName: inviteStaffDto.lastName.trim(),
        role: Role.Admin,
        adminRoleName: role.name,
        user: savedUser,
      });
      const savedAdmin = await this.adminsRepository.save(admin);

      return {
        status: true,
        message: 'Staff invited successfully',
        data: {
          admin: this.serializeAdmin(savedAdmin, savedUser),
          temporaryPassword: tempPassword,
        },
      };
    } catch (error) {
      this.throwAdminError(error);
    }
  }

  async getSystemSettings() {
    try {
      const settings = await this.getOrCreateSystemSettings();

      return {
        status: true,
        message: 'System settings retrieved successfully',
        data: this.serializeSystemSettings(settings),
      };
    } catch (error) {
      this.throwAdminError(error);
    }
  }

  async updateSystemSettings(updateDto: UpdateSystemSettingsDto) {
    try {
      const settings = await this.getOrCreateSystemSettings();
      Object.assign(settings, updateDto);
      const updatedSettings = await this.systemSettingsRepository.save(settings);

      return {
        status: true,
        message: 'System settings updated successfully',
        data: this.serializeSystemSettings(updatedSettings),
      };
    } catch (error) {
      this.throwAdminError(error);
    }
  }

  async remove(id: string) {
    try {
      const admin = await this.adminsRepository.findOneBy({ id });

      if (!admin) {
        throw new NotFoundException('Admin profile not found');
      }

      await this.adminsRepository.remove(admin);

      return {
        status: true,
        message: 'Admin profile removed successfully',
      };
    } catch (error) {
      this.throwAdminError(error);
    }
  }

  private normalizeAdminPayload(payload: AdminPayload) {
    const normalizedPhoneNumber = payload.phoneNumber ?? payload.contact;
    const normalizedContact = payload.contact ?? normalizedPhoneNumber;
    const normalizedAddress = payload.address ?? payload.location;
    const normalizedLocation = payload.location ?? normalizedAddress;
    const rawAdminRoleName =
      payload.adminRoleName ??
      (payload.role && payload.role !== Role.Admin ? payload.role : undefined);

    return {
      ...payload,
      phoneNumber: normalizedPhoneNumber,
      contact: normalizedContact,
      address: normalizedAddress,
      location: normalizedLocation,
      adminRoleName: rawAdminRoleName?.trim() || undefined,
    };
  }

  private async findAdminByUserId(userId: string) {
    const admin = await this.adminsRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!admin) {
      throw new NotFoundException('Admin profile not found');
    }

    return admin;
  }

  private async ensureUniqueUserPhoneNumber(
    userId: string,
    phoneNumber?: string,
  ) {
    if (!phoneNumber) {
      return;
    }

    const existingUser = await this.usersRepository.findOneBy({
      phoneNumber,
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('Phone number already exists');
    }
  }

  private async ensureAdminRoleExists(adminRoleName?: string) {
    if (!adminRoleName) {
      return;
    }

    const existingRole = await this.adminRolesRepository.findOneBy({
      name: adminRoleName,
    });

    if (!existingRole) {
      throw new NotFoundException(
        `Admin role "${adminRoleName}" was not found`,
      );
    }
  }

  private async getOrCreateSystemSettings() {
    const existingSettings = await this.systemSettingsRepository.findOne({
      where: {},
      order: { updatedAt: 'ASC' },
    });

    if (existingSettings) {
      return existingSettings;
    }

    const settings = this.systemSettingsRepository.create();
    return this.systemSettingsRepository.save(settings);
  }

  private serializeAdmin(admin: Admin, user?: User) {
    return {
      id: admin.id,
      profilePhoto: admin.profilePhoto ?? null,
      coverVideoPath: admin.coverVideoPath ?? null,
      bio: admin.bio ?? null,
      firstName: admin.firstName ?? null,
      lastName: admin.lastName ?? null,
      phoneNumber: admin.phoneNumber ?? null,
      contact: admin.contact ?? null,
      country: admin.country ?? null,
      address: admin.address ?? null,
      location: admin.location ?? null,
      postalAddress: admin.postalAddress ?? null,
      role: admin.role,
      adminRoleName: admin.adminRoleName ?? null,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
      user: user
        ? {
            id: user.id,
            email: user.email,
            phoneNumber: user.phoneNumber ?? null,
          }
        : undefined,
    };
  }

  private serializeSystemSettings(settings: SystemSettings) {
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
      updatedAt: settings.updatedAt,
    };
  }

  private generateTemporaryPassword() {
    return `Temp@${randomUUID().replace(/-/g, '').slice(0, 10)}1!`;
  }

  private throwAdminError(error: unknown): never {
    if (
      error instanceof BadRequestException ||
      error instanceof ConflictException ||
      error instanceof NotFoundException
    ) {
      throw error;
    }

    throw new BadRequestException(
      error instanceof Error ? error.message : 'Admin service failed',
    );
  }
}

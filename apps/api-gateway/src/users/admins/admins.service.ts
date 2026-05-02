import { USERS_SERVICE } from '@app/shared';
import {
  BadRequestException,
  GatewayTimeoutException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, timeout, TimeoutError } from 'rxjs';
import { ChangePasswordDto } from '@app/iam';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InviteStaffDto } from './dto/invite-staff.dto';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';

@Injectable()
export class AdminsService {
  private static readonly RMQ_TIMEOUT_MS = 15000;

  constructor(@Inject(USERS_SERVICE) private readonly client: ClientProxy) {}

  async create(createAdminDto: any, userId: string) {
    try {
      return await this.sendWithTimeout('createAdmin', {
        ...createAdminDto,
        userId,
      });
    } catch (error) {
      this.throwGatewayError(error, 'Failed to create admin profile');
    }
  }

  async update(updateAdminDto: any, userId: string) {
    try {
      return await this.sendWithTimeout('updateAdmin', {
        ...updateAdminDto,
        userId,
      });
    } catch (error) {
      this.throwGatewayError(error, 'Failed to update admin profile');
    }
  }

  async getProfile(userId: string) {
    try {
      return await this.sendWithTimeout('admin.getProfile', { userId });
    } catch (error) {
      this.throwGatewayError(error, 'Failed to fetch admin profile');
    }
  }

  async getRoles() {
    try {
      return await this.sendWithTimeout('admin.getRoles', {});
    } catch (error) {
      this.throwGatewayError(error, 'Failed to fetch admin roles');
    }
  }

  async createRole(createRoleDto: CreateRoleDto) {
    try {
      return await this.sendWithTimeout('admin.createRole', { createRoleDto });
    } catch (error) {
      this.throwGatewayError(error, 'Failed to create admin role');
    }
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto) {
    try {
      return await this.sendWithTimeout('admin.updateRole', {
        id,
        updateRoleDto,
      });
    } catch (error) {
      this.throwGatewayError(error, 'Failed to update admin role');
    }
  }

  async deleteRole(id: string) {
    try {
      return await this.sendWithTimeout('admin.deleteRole', { id });
    } catch (error) {
      this.throwGatewayError(error, 'Failed to delete admin role');
    }
  }

  async inviteStaff(inviteStaffDto: InviteStaffDto, invitedByUserId: string) {
    try {
      return await this.sendWithTimeout('admin.inviteStaff', {
        inviteStaffDto,
        invitedByUserId,
      });
    } catch (error) {
      this.throwGatewayError(error, 'Failed to invite staff');
    }
  }

  async getSystemSettings() {
    try {
      return await this.sendWithTimeout('admin.getSystemSettings', {});
    } catch (error) {
      this.throwGatewayError(error, 'Failed to fetch system settings');
    }
  }

  async updateSystemSettings(updateDto: UpdateSystemSettingsDto) {
    try {
      return await this.sendWithTimeout('admin.updateSystemSettings', {
        updateDto,
      });
    } catch (error) {
      this.throwGatewayError(error, 'Failed to update system settings');
    }
  }

  async changePassword(
    changePasswordDto: ChangePasswordDto,
    activeUser: { sub: string; role: string },
  ) {
    if (activeUser.role !== 'Admin') {
      throw new UnauthorizedException('Only admins may change their password');
    }

    try {
      return await this.sendWithTimeout('auth.changePassword', {
        userId: activeUser.sub,
        ...changePasswordDto,
      });
    } catch (error) {
      this.throwGatewayError(error, 'Failed to change admin password');
    }
  }

  private async sendWithTimeout<T>(pattern: string, payload: unknown): Promise<T> {
    try {
      return await lastValueFrom(
        this.client
          .send<T>(pattern, payload)
          .pipe(timeout(AdminsService.RMQ_TIMEOUT_MS)),
      );
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new GatewayTimeoutException(
          `Request to users-service timed out for pattern ${pattern}`,
        );
      }
      throw error;
    }
  }

  private throwGatewayError(error: any, fallbackMessage: string): never {
    if (error instanceof GatewayTimeoutException) {
      throw error;
    }

    if (error instanceof UnauthorizedException) {
      throw new UnauthorizedException(this.getErrorMessage(error));
    }

    if (error instanceof ForbiddenException) {
      throw new ForbiddenException(this.getErrorMessage(error));
    }

    if (error instanceof NotFoundException) {
      throw new NotFoundException(this.getErrorMessage(error));
    }

    throw new BadRequestException(this.getErrorMessage(error) || fallbackMessage);
  }

  private getErrorMessage(error: any): string {
    return (
      error?.response?.message ??
      error?.message ??
      error?.error?.message ??
      (typeof error === 'string' ? error : JSON.stringify(error))
    );
  }
}

// apps/api-gateway/src/users/admins/admins.service.ts
import { USERS_SERVICE } from '@app/shared';
import {
  BadRequestException,
  GatewayTimeoutException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, timeout, TimeoutError } from 'rxjs';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InviteStaffDto } from './dto/invite-staff.dto';

@Injectable()
export class AdminsService {
  private static readonly RMQ_TIMEOUT_MS = 15000;

  constructor(@Inject(USERS_SERVICE) private readonly client: ClientProxy) {}

  async getRoles() {
  try {
    return await this.sendWithTimeout('admin.getRoles', {});
  } catch (error) {
    if (error instanceof GatewayTimeoutException) throw error;
    throw new BadRequestException(this.getErrorMessage(error));
  }
}

async createRole(createRoleDto: CreateRoleDto) {
  try {
    return await this.sendWithTimeout('admin.createRole', { createRoleDto });
  } catch (error) {
    if (error instanceof GatewayTimeoutException) throw error;
    throw new BadRequestException(this.getErrorMessage(error));
  }
}

async updateRole(id: string, updateRoleDto: UpdateRoleDto) {
  try {
    return await this.sendWithTimeout('admin.updateRole', {
      id,
      updateRoleDto,
    });
  } catch (error) {
    if (error instanceof GatewayTimeoutException) throw error;
    throw new BadRequestException(this.getErrorMessage(error));
  }
}

async deleteRole(id: string) {
  try {
    return await this.sendWithTimeout('admin.deleteRole', { id });
  } catch (error) {
    if (error instanceof GatewayTimeoutException) throw error;
    throw new BadRequestException(this.getErrorMessage(error));
  }
}

async inviteStaff(inviteStaffDto: InviteStaffDto, invitedByEmail: string) {
  try {
    return await this.sendWithTimeout('admin.inviteStaff', {
      inviteStaffDto,
      invitedByEmail,
    });
  } catch (error) {
    if (error instanceof GatewayTimeoutException) throw error;
    throw new BadRequestException(this.getErrorMessage(error));
  }
}

  // ── Existing ──────────────────────────────────────────────────────────────

  async create(createAdminDto: any) {
    try {
      const result = await lastValueFrom(
        this.client
          .send('createAdmin', createAdminDto)
          .pipe(timeout(AdminsService.RMQ_TIMEOUT_MS)),
      );
      return result;
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new GatewayTimeoutException(
          `Request to users-service timed out for pattern createAdmin`
        );
      }
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(this.getErrorMessage(error));
      }
      throw new BadRequestException(this.getErrorMessage(error));
    }
  }

  // ── New ───────────────────────────────────────────────────────────────────

  async getProfile(userId: string) {
    try {
      return await this.sendWithTimeout('admin.getProfile', { userId });
    } catch (error) {
      if (error instanceof GatewayTimeoutException) throw error;
      throw new BadRequestException(this.getErrorMessage(error));
    }
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    try {
      return await this.sendWithTimeout('admin.updateProfile', {
        userId,
        updateProfileDto,
      });
    } catch (error) {
      if (error instanceof GatewayTimeoutException) throw error;
      throw new BadRequestException(this.getErrorMessage(error));
    }
  }

  async updateProfilePhoto(userId: string, photoUrl: string) {
    try {
      return await this.sendWithTimeout('admin.updateProfilePhoto', {
        userId,
        photoUrl,
      });
    } catch (error) {
      if (error instanceof GatewayTimeoutException) throw error;
      throw new BadRequestException(this.getErrorMessage(error));
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    try {
      return await this.sendWithTimeout('admin.changePassword', {
        userId,
        changePasswordDto,
      });
    } catch (error) {
      if (error instanceof GatewayTimeoutException) throw error;
      throw new BadRequestException(this.getErrorMessage(error));
    }
  }

  // ── Shared helpers ────────────────────────────────────────────────────────

  private async sendWithTimeout<T>(
    pattern: string,
    payload: unknown,
  ): Promise<T> {
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

  private getErrorMessage(error: any): string {
    return (
      error?.response?.message ??
      error?.message ??
      error?.error?.message ??
      (typeof error === 'string' ? error : JSON.stringify(error))
    );
  }
}

/**
 * apps/api-gateway/src/users/admins/admins.service.ts
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InviteStaffDto } from './dto/invite-staff.dto';

async getRoles() {
  try {
    return await this.sendWithTimeout('admin.getRoles', {});
  } catch (error) {
    if (error instanceof GatewayTimeoutException) throw error;
    throw new BadRequestException(this.getErrorMessage(error));
  }
}

async createRole(createRoleDto: CreateRoleDto) {
  try {
    return await this.sendWithTimeout('admin.createRole', { createRoleDto });
  } catch (error) {
    if (error instanceof GatewayTimeoutException) throw error;
    throw new BadRequestException(this.getErrorMessage(error));
  }
}

async updateRole(id: string, updateRoleDto: UpdateRoleDto) {
  try {
    return await this.sendWithTimeout('admin.updateRole', {
      id,
      updateRoleDto,
    });
  } catch (error) {
    if (error instanceof GatewayTimeoutException) throw error;
    throw new BadRequestException(this.getErrorMessage(error));
  }
}

async deleteRole(id: string) {
  try {
    return await this.sendWithTimeout('admin.deleteRole', { id });
  } catch (error) {
    if (error instanceof GatewayTimeoutException) throw error;
    throw new BadRequestException(this.getErrorMessage(error));
  }
}

async inviteStaff(inviteStaffDto: InviteStaffDto, invitedByEmail: string) {
  try {
    return await this.sendWithTimeout('admin.inviteStaff', {
      inviteStaffDto,
      invitedByEmail,
    });
  } catch (error) {
    if (error instanceof GatewayTimeoutException) throw error;
    throw new BadRequestException(this.getErrorMessage(error));
  }
} 
 */

// import { USERS_SERVICE } from '@app/shared';
// import {
//   BadRequestException,
//   GatewayTimeoutException,
//   Inject,
//   Injectable,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { ClientProxy } from '@nestjs/microservices';
// import { lastValueFrom, timeout, TimeoutError } from 'rxjs';

// @Injectable()
// export class AdminsService {
//   private static readonly RMQ_TIMEOUT_MS = 15000;

//   constructor(@Inject(USERS_SERVICE) private readonly client: ClientProxy) {}

//   async create(createAdminDto: any) {
//     try {
//       const result = await lastValueFrom(
//         this.client
//           .send('createAdmin', createAdminDto)
//           .pipe(timeout(AdminsService.RMQ_TIMEOUT_MS)),
//       );
//       return result;
//     } catch (error) {
//       if (error instanceof TimeoutError) {
//         throw new GatewayTimeoutException(
//           'Request to users-service timed out for pattern createAdmin',
//         );
//       }
//       if (error instanceof UnauthorizedException) {
//         throw new UnauthorizedException(this.getErrorMessage(error));
//       }
//       throw new BadRequestException(this.getErrorMessage(error));
//     }
//   }

//   private getErrorMessage(error: any): string {
//     return (
//       error?.response?.message ??
//       error?.message ??
//       error?.error?.message ??
//       (typeof error === 'string' ? error : JSON.stringify(error))
//     );
//   }
// }

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
import { ChangePasswordDto } from '@app/iam';

@Injectable()
export class AdminsService {
  private static readonly RMQ_TIMEOUT_MS = 15000;

  constructor(@Inject(USERS_SERVICE) private readonly client: ClientProxy) {}

  async create(createAdminDto: any, userId: string) {
    try {
      const result = await lastValueFrom(
        this.client
          .send('createAdmin', { ...createAdminDto, userId })
          .pipe(timeout(AdminsService.RMQ_TIMEOUT_MS)),
      );
      return result;
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new GatewayTimeoutException(
          'Request to users-service timed out for pattern createAdmin',
        );
      }
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(this.getErrorMessage(error));
      }
      throw new BadRequestException(this.getErrorMessage(error));
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
      const result = await lastValueFrom(
        this.client
          .send('auth.changePassword', {
            userId: activeUser.sub,
            ...changePasswordDto,
          })
          .pipe(timeout(AdminsService.RMQ_TIMEOUT_MS)),
      );
      return result;
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new GatewayTimeoutException(
          'Request to users-service timed out for pattern auth.changePassword',
        );
      }
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(this.getErrorMessage(error));
      }
      throw new BadRequestException(this.getErrorMessage(error));
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

import { UpdateUserDto } from '@app/users';
import { USERS_SERVICE } from '@app/shared';
import {
  BadRequestException,
  ConflictException,
  GatewayTimeoutException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, timeout, TimeoutError } from 'rxjs';

@Injectable()
export class UsersService {
  private static readonly RMQ_TIMEOUT_MS = 15000;

  constructor(@Inject(USERS_SERVICE) private readonly client: ClientProxy) {}

  private async sendWithTimeout<T>(pattern: string, payload: unknown): Promise<T> {
    try {
      return await lastValueFrom(
        this.client
          .send<T>(pattern, payload)
          .pipe(timeout(UsersService.RMQ_TIMEOUT_MS)),
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

  async findAll() {
    try {
      return await this.sendWithTimeout('users.findAll', {});
    } catch (error) {
      if (error instanceof GatewayTimeoutException) {
        throw error;
      }
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(this.getErrorMessage(error));
      }
      throw new BadRequestException(this.getErrorMessage(error));
    }
  }

  async findOne(id: string) {
    try {
      return await this.sendWithTimeout('users.findOne', id);
    } catch (error) {
      if (error instanceof GatewayTimeoutException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException(this.getErrorMessage(error));
      }
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(this.getErrorMessage(error));
      }
      throw new BadRequestException(this.getErrorMessage(error));
    }
  }

  async update(id: string, updateUserDto: Omit<UpdateUserDto, 'id'>) {
    try {
      return await this.sendWithTimeout('users.update', { id, ...updateUserDto });
    } catch (error) {
      if (error instanceof GatewayTimeoutException) {
        throw error;
      }
      if (error instanceof ConflictException) {
        throw new ConflictException(this.getErrorMessage(error));
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException(this.getErrorMessage(error));
      }
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(this.getErrorMessage(error));
      }
      throw new BadRequestException(this.getErrorMessage(error));
    }
  }

  async remove(id: string) {
    try {
      return await this.sendWithTimeout('users.delete', id);
    } catch (error) {
      if (error instanceof GatewayTimeoutException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException(this.getErrorMessage(error));
      }
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(this.getErrorMessage(error));
      }
      throw new BadRequestException(this.getErrorMessage(error));
    }
  }

  async me(userId: string) {
    try {
      return await this.sendWithTimeout('users.me', userId);
    } catch (error) {
      if (error instanceof GatewayTimeoutException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException(this.getErrorMessage(error));
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

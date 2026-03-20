import { SignUpDto } from '@app/iam';
import { USERS_SERVICE } from '@app/shared';
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(@Inject(USERS_SERVICE) private readonly client: ClientProxy) {}

  async findAll() {
    try {
      const users = await lastValueFrom(this.client.send('users.findAll', {}));
      return users;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(this.getErrorMessage(error));
      }
      throw new UnauthorizedException(this.getErrorMessage(error));
    }
  }

  async findOne(id: string) {
    try {
      const user = await lastValueFrom(this.client.send('users.findOne', id));
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(this.getErrorMessage(error));
      }
      throw new UnauthorizedException(this.getErrorMessage(error));
    }
  }

  async update(id: string, updateUserDto: SignUpDto) {
    try {
      const user = await lastValueFrom(
        this.client.send('users.update', { id, ...updateUserDto }),
      );
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(this.getErrorMessage(error));
      }
      throw new UnauthorizedException(this.getErrorMessage(error));
    }
  }

  async remove(id: string) {
    try {
      const user = await lastValueFrom(this.client.send('users.delete', id));
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(this.getErrorMessage(error));
      }
      throw new UnauthorizedException(this.getErrorMessage(error));
    }
  }

  async me(userId: string) {
    try {
      const user = await lastValueFrom(this.client.send('users.me', userId));
      return user;
    } catch (error) {
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

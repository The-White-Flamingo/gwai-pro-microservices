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
        throw new UnauthorizedException(error.message);
      }
      throw new BadRequestException(error.messsage);
    }
  }

  async findOne(id: string) {
    try {
      const user = await lastValueFrom(this.client.send('users.findOne', id));
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(error.message);
      }
      throw new BadRequestException(error.messsage);
    }
  }

  async orders(id: string) {
    try {
      const orders = await lastValueFrom(this.client.send('users.orders', id));
      return orders;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(error.message);
      }
      throw new BadRequestException(error.messsage);
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
        throw new UnauthorizedException(error.message);
      }
      throw new BadRequestException(error.messsage);
    }
  }

  async remove(id: string) {
    try {
      const user = await lastValueFrom(this.client.send('users.delete', id));
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(error.message);
      }
      throw new BadRequestException(error.messsage);
    }
  }
}

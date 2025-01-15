import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from '@app/users';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  async findAll() {
    try {
      const users = await this.usersRepository.find();

      return {
        status: true,
        message: 'Users fetched successfully',
        data: users,
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
   try {
    const user = await this.usersRepository.findOne({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      status: true,
      message: 'User fetched successfully',
      data: user,
    }
   } catch (error) {
    if (error instanceof NotFoundException) {
      throw new NotFoundException(error.message);
    }
    throw new BadRequestException(error.message);
   }
  }

  async update(updateUserDto: UpdateUserDto) {
    try {
      const user = await this.usersRepository.findOneBy({ id: updateUserDto.id });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.usersRepository.update(updateUserDto.id, updateUserDto);

      return {
        status: true,
        message: 'User updated successfully',
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const user = await this.usersRepository.findOneBy({ id });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.usersRepository.delete(id);

      return {
        status: true,
        message: 'User deleted successfully',
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }
}

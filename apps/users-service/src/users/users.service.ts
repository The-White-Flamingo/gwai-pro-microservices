import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from '@app/users';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Role } from './enums/role.enum';
import { Client } from './clients/entities/client.entity';
import { Musician } from './musicians/entities/musician.entity';
import { Studio } from './studios/entities/studio.entity';
import { Admin } from './admins/entities/admin.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
    @InjectRepository(Musician)
    private readonly musiciansRepository: Repository<Musician>,
    @InjectRepository(Studio)
    private readonly studiosRepository: Repository<Studio>,
    @InjectRepository(Admin)
    private readonly adminsRepository: Repository<Admin>,
  ) {}

  async findAll() {
    try {
      const users = await this.usersRepository.find();

      return {
        status: true,
        message: 'Users fetched successfully',
        data: users.map((user) => this.sanitizeUser(user)),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.usersRepository.findOne({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        status: true,
        message: 'User fetched successfully',
        data: this.sanitizeUser(user),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  async update(updateUserDto: UpdateUserDto) {
    try {
      const user = await this.usersRepository.findOneBy({
        id: updateUserDto.id,
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      Object.assign(user, updateUserDto);
      await this.usersRepository.save(user);

      const updatedUser = await this.usersRepository.findOneByOrFail({
        id: updateUserDto.id,
      });

      return {
        status: true,
        message: 'User updated successfully',
        data: this.sanitizeUser(updatedUser),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error?.code === '23505') {
        throw new ConflictException('Email, username, or phone number already exists');
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
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  async me(userId: string) {
    try {
      const user = await this.usersRepository.findOneBy({ id: userId });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const safeUser = this.sanitizeUser(user);
      let profile: Client | Musician | Studio | Admin | null = null;
      let profileType = user.role;

      if (user.role === Role.Client) {
        profile = await this.clientsRepository.findOne({
          where: { user: { id: user.id } },
          relations: ['user'],
        });
      } else if (user.role === Role.Musician) {
        profile = await this.musiciansRepository.findOne({
          where: { user: { id: user.id } },
          relations: ['user'],
        });
      } else if (user.role === Role.Studio) {
        profile = await this.studiosRepository.findOne({
          where: { user: { id: user.id } },
          relations: ['user'],
        });
      } else if (user.role === Role.Admin) {
        profile = await this.adminsRepository.findOne({
          where: { user: { id: user.id } },
          relations: ['user'],
        });
      }

      const safeProfile = profile
        ? {
            ...profile,
            user: profile.user ? this.sanitizeUser(profile.user as User) : null,
          }
        : null;

      return {
        status: true,
        message: 'Current user fetched successfully',
        data: {
          user: safeUser,
          profileType,
          profile: safeProfile,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  private sanitizeUser(user: User) {
    const { password, ...safeUser } = user;
    return safeUser;
  }
}

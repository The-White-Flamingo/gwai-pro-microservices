import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../enums/role.enum';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createClientDto: CreateClientDto & { userId: string }) {
    try {
      const { userId, ...profilePayload } = createClientDto;
      const user = await this.usersRepository.findOneBy({ id: userId });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const existingProfile = await this.clientsRepository.findOne({
        where: { user: { id: userId } },
      });

      if (existingProfile) {
        throw new ConflictException('Client profile already exists');
      }

      await this.ensureUniqueUserFields(
        user.id,
        profilePayload.username,
        profilePayload.phone,
      );

      user.username = profilePayload.username;
      user.phoneNumber = profilePayload.phone;
      user.role = Role.Client;
      await this.usersRepository.save(user);

      const client = this.clientsRepository.create({
        ...profilePayload,
        user,
      });
      const savedClient = await this.clientsRepository.save(client);

      return {
        status: true,
        message: 'Client profile created successfully',
        data: savedClient,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  findAll() {
    return `This action returns all clients`;
  }

  findOne(id: number) {
    return `This action returns a #${id} client`;
  }

  update(id: number, updateClientDto: UpdateClientDto) {
    return `This action updates a #${id} client`;
  }

  async updateProfile(updateClientDto: Partial<UpdateClientDto> & { userId: string }) {
    try {
      const { userId, ...profilePayload } = updateClientDto;
      const client = await this.clientsRepository.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });

      if (!client) {
        throw new NotFoundException('Client profile not found');
      }

      const user = client.user;
      await this.ensureUniqueUserFields(
        user.id,
        profilePayload.username,
        profilePayload.phone,
      );

      if (profilePayload.username !== undefined) {
        user.username = profilePayload.username;
      }
      if (profilePayload.phone !== undefined) {
        user.phoneNumber = profilePayload.phone;
      }
      user.role = Role.Client;
      await this.usersRepository.save(user);

      Object.assign(client, profilePayload);
      const updatedClient = await this.clientsRepository.save(client);

      return {
        status: true,
        message: 'Client profile updated successfully',
        data: updatedClient,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  private async ensureUniqueUserFields(
    userId: string,
    username?: string,
    phone?: string,
  ) {
    if (username) {
      const existingUserByUsername = await this.usersRepository.findOneBy({
        username,
      });
      if (existingUserByUsername && existingUserByUsername.id !== userId) {
        throw new ConflictException('Username already exists');
      }
    }

    if (phone) {
      const existingUserByPhone = await this.usersRepository.findOneBy({
        phoneNumber: phone,
      });
      if (existingUserByPhone && existingUserByPhone.id !== userId) {
        throw new ConflictException('Phone number already exists');
      }
    }
  }

  remove(id: number) {
    return `This action removes a #${id} client`;
  }
}

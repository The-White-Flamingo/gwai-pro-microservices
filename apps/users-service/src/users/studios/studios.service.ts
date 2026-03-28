import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStudioDto } from './dto/create-studio.dto';
import { UpdateStudioDto } from './dto/update-studio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Studio } from './entities/studio.entity';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../enums/role.enum';

@Injectable()
export class StudiosService {
  constructor(
    @InjectRepository(Studio)
    private readonly studiosRepository: Repository<Studio>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createStudioDto: CreateStudioDto & { userId: string }) {
    try {
      const { userId, ...profilePayload } = createStudioDto;
      const user = await this.usersRepository.findOneBy({ id: userId });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const existingProfile = await this.studiosRepository.findOne({
        where: { user: { id: userId } },
      });

      if (existingProfile) {
        throw new ConflictException('Studio profile already exists');
      }

      user.role = Role.Studio;
      await this.usersRepository.save(user);

      const studio = this.studiosRepository.create({
        ...profilePayload,
        user,
      });
      const savedStudio = await this.studiosRepository.save(studio);

      return {
        status: true,
        message: 'Studio profile created successfully',
        data: savedStudio,
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
    return `This action returns all studios`;
  }

  findOne(id: number) {
    return `This action returns a #${id} studio`;
  }

  update(id: number, updateStudioDto: UpdateStudioDto) {
    return `This action updates a #${id} studio`;
  }

  async updateProfile(updateStudioDto: Partial<UpdateStudioDto> & { userId: string }) {
    try {
      const { userId, ...profilePayload } = updateStudioDto;
      const studio = await this.studiosRepository.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });

      if (!studio) {
        throw new NotFoundException('Studio profile not found');
      }

      Object.assign(studio, profilePayload);
      const updatedStudio = await this.studiosRepository.save(studio);

      return {
        status: true,
        message: 'Studio profile updated successfully',
        data: updatedStudio,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} studio`;
  }
}

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMusicianDto } from './dto/create-musician.dto';
import { UpdateMusicianDto } from './dto/update-musician.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Musician } from './entities/musician.entity';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../enums/role.enum';

@Injectable()
export class MusiciansService {
  constructor(
    @InjectRepository(Musician)
    private readonly musiciansRepository: Repository<Musician>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createMusicianDto: CreateMusicianDto & { userId: string }) {
    try {
      const { userId, ...profilePayload } = createMusicianDto;
      const user = await this.usersRepository.findOneBy({ id: userId });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const existingProfile = await this.musiciansRepository.findOne({
        where: { user: { id: userId } },
      });

      if (existingProfile) {
        throw new ConflictException('Musician profile already exists');
      }

      user.role = Role.Musician;
      await this.usersRepository.save(user);

      const musician = this.musiciansRepository.create({
        ...profilePayload,
        user,
      });
      const savedMusician = await this.musiciansRepository.save(musician);

      return {
        status: true,
        message: 'Musician profile created successfully',
        data: savedMusician,
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
    return `This action returns all musicians`;
  }

  findOne(id: number) {
    return `This action returns a #${id} musician`;
  }

  update(id: number, updateMusicianDto: UpdateMusicianDto) {
    return `This action updates a #${id} musician`;
  }

  async updateProfile(
    updateMusicianDto: Partial<UpdateMusicianDto> & { userId: string },
  ) {
    try {
      const { userId, ...profilePayload } = updateMusicianDto;
      const musician = await this.musiciansRepository.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });

      if (!musician) {
        throw new NotFoundException('Musician profile not found');
      }

      Object.assign(musician, profilePayload);
      const updatedMusician = await this.musiciansRepository.save(musician);

      return {
        status: true,
        message: 'Musician profile updated successfully',
        data: updatedMusician,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} musician`;
  }
}

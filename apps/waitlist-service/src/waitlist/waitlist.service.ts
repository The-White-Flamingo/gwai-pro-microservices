import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWaitlistDto } from '@app/shared';
import { InjectRepository } from '@nestjs/typeorm';
import { Waitlist } from './entities/waitlist.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WaitlistService {
  constructor(@InjectRepository(Waitlist) private readonly waitlistRepository: Repository<Waitlist>) {}

  async create(createWaitlistDto: CreateWaitlistDto) {
   try {
    const waitlist = await this.waitlistRepository.create({
      ...createWaitlistDto,
    });

    await this.waitlistRepository.save(waitlist);

    return {
      status: true,
      message: 'Waitlist created successfully',
      data: waitlist,
    };
   } catch (error) {
    return new BadRequestException(error.message).getResponse();
   }
  }

  async findAll() {
    try {
      const waitlist = await this.waitlistRepository.find();
      return {
        status: true,
        message: 'Waitlist retrieved successfully',
        data: waitlist,
      };
    } catch (error) {
      return new BadRequestException(error.message).getResponse();
    }
  }

  async findOne(id: string) {
   try {
    const waitlist = await this.waitlistRepository.findOne({
      where: { id },
    });

    if (!waitlist) {
      return new NotFoundException('Waitlist item not found').getResponse();
    }

    return {
      status: true,
      message: 'Waitlist retrieved successfully',
      data: waitlist,
    };
   } catch (error) {
    return new BadRequestException(error.message).getResponse();
   }
  }
}

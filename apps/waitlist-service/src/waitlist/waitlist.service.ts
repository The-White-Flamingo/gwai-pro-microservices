import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMailerDto, CreateWaitlistDto, MAILING_SERVICE } from '@app/shared';
import { InjectRepository } from '@nestjs/typeorm';
import { Waitlist } from './entities/waitlist.entity';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class WaitlistService {
  constructor(
    @InjectRepository(Waitlist) private readonly waitlistRepository: Repository<Waitlist>,
    @Inject(MAILING_SERVICE) private readonly client: ClientProxy,
  ) {}

  async create(createWaitlistDto: CreateWaitlistDto) {
   try {
    const waitlist = await this.waitlistRepository.create({
      ...createWaitlistDto,
    });

    await this.waitlistRepository.save(waitlist);

    await this.client.send('mailer.send', {
      to: createWaitlistDto.email,
      subject: 'Welcome to the Gwaipro',
      text: `You have been added to the waitlist. We will notify you when we are ready to launch.`,
    } as CreateMailerDto);

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

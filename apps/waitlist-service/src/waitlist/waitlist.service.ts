import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMailerDto, CreateWaitlistDto, MAILING_SERVICE } from '@app/shared';
import { InjectRepository } from '@nestjs/typeorm';
import { Waitlist } from './entities/waitlist.entity';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class WaitlistService {
  constructor(
    @InjectRepository(Waitlist) private readonly waitlistRepository: Repository<Waitlist>,
    @Inject(MAILING_SERVICE) private readonly client: ClientProxy,
  ) {}

  async create(createWaitlistDto: CreateWaitlistDto) {
    try {
      const emailExists = await this.waitlistRepository.findOne({ where: { email: createWaitlistDto.email } });

      if (emailExists) {
        return new BadRequestException('Email already exists in the waitlist').getResponse();
      }

      const waitlist = this.waitlistRepository.create(createWaitlistDto);
      await this.waitlistRepository.save(waitlist);

      try {
        await lastValueFrom(this.client.send<CreateMailerDto>('mailer.send', {
          to: createWaitlistDto.email,
          subject: 'Welcome to Gwaipro',
          text: 'You have been added to the waitlist. We will notify you when we are ready to launch.',
        }));
      } catch (mailError) {
        console.error('Email sending failed:', mailError);
      }

      return {
        status: true,
        message: 'Waitlist created successfully',
        data: waitlist,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
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
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    const waitlist = await this.waitlistRepository.findOne({ where: { id } });

    if (!waitlist) {
      throw new NotFoundException('Waitlist item not found');
    }

    return {
      status: true,
      message: 'Waitlist retrieved successfully',
      data: waitlist,
    };
  }
}

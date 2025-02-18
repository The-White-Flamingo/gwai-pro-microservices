import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateWaitlistDto, WAITLIST_SERVICE } from '@app/shared';
import { lastValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class WaitlistService {
  constructor(@Inject(WAITLIST_SERVICE) private readonly client: ClientProxy) { }
  
  async create(createWaitlistDto: CreateWaitlistDto) {
    try {
          const waitlist = await lastValueFrom(
            this.client.send('waitlist.create', {...createWaitlistDto}),
          );
          return waitlist;
        } catch (error) {
          throw new BadRequestException(error.message);
        }
  }

  async findAll() {
    try {
      const waitlist = await lastValueFrom(
        this.client.send('waitlist.findAll', {}),
      );
      return waitlist;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: number) {
    try {
      const waitlist = await lastValueFrom(
        this.client.send('waitlist.findOne', {}),
      );
      return waitlist;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}

import { Injectable } from '@nestjs/common';
import { CreateWaitlistDto } from '@app/shared';

@Injectable()
export class WaitlistService {
  create(createWaitlistDto: CreateWaitlistDto) {
    return 'This action adds a new waitlist';
  }

  findAll() {
    return `This action returns all waitlist`;
  }

  findOne(id: number) {
    return `This action returns a #${id} waitlist`;
  }
}

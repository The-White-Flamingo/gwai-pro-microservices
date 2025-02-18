import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WaitlistService } from './waitlist.service';
import { CreateWaitlistDto } from '@app/shared';

@Controller()
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) { }

  @MessagePattern('waitlist.create')
  create(@Payload() createWaitlistDto: CreateWaitlistDto) {
    return this.waitlistService.create(createWaitlistDto);
  }

  @MessagePattern('waitlist.findAll')
  findAll() {
    return this.waitlistService.findAll();
  }

  @MessagePattern('waitlist.findOne')
  findOne(@Payload() id: number) {
    return this.waitlistService.findOne(id);
  }

  // @MessagePattern('updateWaitlist')
  // update(@Payload() updateWaitlistDto: UpdateWaitlistDto) {
  //   return this.waitlistService.update(updateWaitlistDto.id, updateWaitlistDto);
  // }

  // @MessagePattern('removeWaitlist')
  // remove(@Payload() id: number) {
  //   return this.waitlistService.remove(id);
  // }
}

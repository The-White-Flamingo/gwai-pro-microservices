import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MusiciansService } from './musicians.service';
import { CreateMusicianDto } from './dto/create-musician.dto';
import { UpdateMusicianDto } from './dto/update-musician.dto';

@Controller()
export class MusiciansController {
  constructor(private readonly musiciansService: MusiciansService) {}

  @MessagePattern('createMusician')
  create(@Payload() payload: CreateMusicianDto & { userId: string }) {
    return this.musiciansService.create(payload);
  }

  @MessagePattern('findAllMusicians')
  findAll() {
    return this.musiciansService.findAll();
  }

  @MessagePattern('findOneMusician')
  findOne(@Payload() id: number) {
    return this.musiciansService.findOne(id);
  }

  @MessagePattern('updateMusician')
  update(@Payload() updateMusicianDto: UpdateMusicianDto) {
    return this.musiciansService.update(
      updateMusicianDto.id,
      updateMusicianDto,
    );
  }

  @MessagePattern('updateMusicianProfile')
  updateProfile(
    @Payload() payload: Partial<UpdateMusicianDto> & { userId: string },
  ) {
    return this.musiciansService.updateProfile(payload);
  }

  @MessagePattern('removeMusician')
  remove(@Payload() id: number) {
    return this.musiciansService.remove(id);
  }
}

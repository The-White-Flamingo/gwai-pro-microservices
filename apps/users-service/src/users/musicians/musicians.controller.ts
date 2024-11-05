import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MusiciansService } from './musicians.service';
import { CreateMusicianDto } from './dto/create-musician.dto';
import { UpdateMusicianDto } from './dto/update-musician.dto';

@Controller()
export class MusiciansController {
  constructor(private readonly musiciansService: MusiciansService) {}

  @MessagePattern('createMusician')
  create(@Payload() createMusicianDto: CreateMusicianDto) {
    return this.musiciansService.create(createMusicianDto);
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

  @MessagePattern('removeMusician')
  remove(@Payload() id: number) {
    return this.musiciansService.remove(id);
  }
}

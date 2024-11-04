import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { StudiosService } from './studios.service';
import { CreateStudioDto } from './dto/create-studio.dto';
import { UpdateStudioDto } from './dto/update-studio.dto';

@Controller()
export class StudiosController {
  constructor(private readonly studiosService: StudiosService) {}

  @MessagePattern('createStudio')
  create(@Payload() createStudioDto: CreateStudioDto) {
    return this.studiosService.create(createStudioDto);
  }

  @MessagePattern('findAllStudios')
  findAll() {
    return this.studiosService.findAll();
  }

  @MessagePattern('findOneStudio')
  findOne(@Payload() id: number) {
    return this.studiosService.findOne(id);
  }

  @MessagePattern('updateStudio')
  update(@Payload() updateStudioDto: UpdateStudioDto) {
    return this.studiosService.update(updateStudioDto.id, updateStudioDto);
  }

  @MessagePattern('removeStudio')
  remove(@Payload() id: number) {
    return this.studiosService.remove(id);
  }
}

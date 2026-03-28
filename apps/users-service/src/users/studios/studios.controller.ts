import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { StudiosService } from './studios.service';
import { CreateStudioDto } from './dto/create-studio.dto';
import { UpdateStudioDto } from './dto/update-studio.dto';

@Controller()
export class StudiosController {
  constructor(private readonly studiosService: StudiosService) {}

  @MessagePattern('createStudio')
  create(@Payload() payload: CreateStudioDto & { userId: string }) {
    return this.studiosService.create(payload);
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

  @MessagePattern('updateStudioProfile')
  updateProfile(@Payload() payload: Partial<UpdateStudioDto> & { userId: string }) {
    return this.studiosService.updateProfile(payload);
  }

  @MessagePattern('removeStudio')
  remove(@Payload() id: number) {
    return this.studiosService.remove(id);
  }
}

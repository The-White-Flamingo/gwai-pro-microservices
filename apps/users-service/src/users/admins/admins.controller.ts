import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Controller()
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @MessagePattern('createAdmin')
  create(@Payload() payload: CreateAdminDto & { userId: string }) {
    return this.adminsService.create(payload);
  }

  @MessagePattern('findAllAdmins')
  findAll() {
    return this.adminsService.findAll();
  }

  @MessagePattern('findOneAdmin')
  findOne(@Payload() id: string) {
    return this.adminsService.findOne(id);
  }

  @MessagePattern('updateAdmin')
  update(@Payload() updateAdminDto: UpdateAdminDto) {
    return this.adminsService.updateProfile(updateAdminDto as UpdateAdminDto & { userId: string });
  }

  @MessagePattern('removeAdmin')
  remove(@Payload() id: string) {
    return this.adminsService.remove(id);
  }
}

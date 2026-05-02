import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InviteStaffDto } from './dto/invite-staff.dto';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';

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

  @MessagePattern('admin.getProfile')
  getProfile(@Payload() payload: { userId: string }) {
    return this.adminsService.getProfile(payload.userId);
  }

  @MessagePattern('updateAdmin')
  update(@Payload() updateAdminDto: UpdateAdminDto) {
    return this.adminsService.updateProfile(updateAdminDto as UpdateAdminDto & { userId: string });
  }

  @MessagePattern('admin.getRoles')
  getRoles() {
    return this.adminsService.getRoles();
  }

  @MessagePattern('admin.createRole')
  createRole(@Payload() payload: { createRoleDto: CreateRoleDto }) {
    return this.adminsService.createRole(payload.createRoleDto);
  }

  @MessagePattern('admin.updateRole')
  updateRole(
    @Payload() payload: { id: string; updateRoleDto: UpdateRoleDto },
  ) {
    return this.adminsService.updateRole(payload.id, payload.updateRoleDto);
  }

  @MessagePattern('admin.deleteRole')
  deleteRole(@Payload() payload: { id: string }) {
    return this.adminsService.deleteRole(payload.id);
  }

  @MessagePattern('admin.inviteStaff')
  inviteStaff(
    @Payload() payload: { inviteStaffDto: InviteStaffDto; invitedByUserId: string },
  ) {
    return this.adminsService.inviteStaff(
      payload.inviteStaffDto,
      payload.invitedByUserId,
    );
  }

  @MessagePattern('admin.getSystemSettings')
  getSystemSettings() {
    return this.adminsService.getSystemSettings();
  }

  @MessagePattern('admin.updateSystemSettings')
  updateSystemSettings(
    @Payload() payload: { updateDto: UpdateSystemSettingsDto },
  ) {
    return this.adminsService.updateSystemSettings(payload.updateDto);
  }

  @MessagePattern('removeAdmin')
  remove(@Payload() id: string) {
    return this.adminsService.remove(id);
  }
}

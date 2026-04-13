// apps/users-service/src/users/admins/admins.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AdminsService } from './admins.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
// import { UpdateNotificationsDto } from './dto/update-notifications.dto';

@Controller()
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @MessagePattern('admin.getProfile')
  getProfile(@Payload() payload: { userId: string }) {
    return this.adminsService.getProfile(payload.userId);
  }

  @MessagePattern('admin.updateProfile')
  updateProfile(
    @Payload() payload: { userId: string; updateProfileDto: UpdateProfileDto },
  ) {
    return this.adminsService.updateProfile(
      payload.userId,
      payload.updateProfileDto,
    );
  }

  @MessagePattern('admin.updateProfilePhoto')
  updateProfilePhoto(
    @Payload() payload: { userId: string; photoUrl: string },
  ) {
    return this.adminsService.updateProfilePhoto(
      payload.userId,
      payload.photoUrl,
    );
  }

  @MessagePattern('admin.changePassword')
  changePassword(
    @Payload() payload: { userId: string; changePasswordDto: ChangePasswordDto },
  ) {
    return this.adminsService.changePassword(
      payload.userId,
      payload.changePasswordDto,
    );
  }

  // @MessagePattern('admin.getNotifications')
  // getNotifications(@Payload() payload: { userId: string }) {
  //   return this.adminsService.getNotifications(payload.userId);
  // }

  // @MessagePattern('admin.updateNotifications')
  // updateNotifications(
  //   @Payload() payload: {
  //     userId: string;
  //     updateNotificationsDto: UpdateNotificationsDto;
  //   },
  // ) {
  //   return this.adminsService.updateNotifications(
  //     payload.userId,
  //     payload.updateNotificationsDto,
  //   );
  // }
}
// import { Controller } from '@nestjs/common';
// import { MessagePattern, Payload } from '@nestjs/microservices';
// import { AdminsService } from './admins.service';
// import { CreateAdminDto } from './dto/create-admin.dto';
// import { UpdateAdminDto } from './dto/update-admin.dto';

// @Controller()
// export class AdminsController {
//   constructor(private readonly adminsService: AdminsService) {}

//   @MessagePattern('createAdmin')
//   create(@Payload() createAdminDto: CreateAdminDto) {
//     return this.adminsService.create(createAdminDto);
//   }

//   @MessagePattern('findAllAdmins')
//   findAll() {
//     return this.adminsService.findAll();
//   }

//   @MessagePattern('findOneAdmin')
//   findOne(@Payload() id: number) {
//     return this.adminsService.findOne(id);
//   }

//   @MessagePattern('updateAdmin')
//   update(@Payload() updateAdminDto: UpdateAdminDto) {
//     return this.adminsService.update(updateAdminDto.id, updateAdminDto);
//   }

//   @MessagePattern('removeAdmin')
//   remove(@Payload() id: number) {
//     return this.adminsService.remove(id);
//   }
// }

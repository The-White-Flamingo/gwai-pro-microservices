// apps/api-gateway/src/users/admins/admins.controller.ts
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
  Delete,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ActiveUser, ActiveUserData, Roles } from '@app/iam';
import { Role } from '@app/iam'; // reuse your existing enum
import { AdminsService } from './admins.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InviteStaffDto } from './dto/invite-staff.dto';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';

@ApiBearerAuth()
@ApiTags('admins')
@Roles(Role.Admin)
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get('settings/system')
  @ApiOperation({ summary: 'Get system settings' })
  @ApiResponse({ status: 200, description: 'System settings fetched successfully' })
  getSystemSettings() {
    return this.adminsService.getSystemSettings();
  }

  @Patch('settings/system')
  @ApiOperation({ summary: 'Update system settings' })
  @ApiResponse({ status: 200, description: 'System settings updated successfully' })
  updateSystemSettings(@Body() updateDto: UpdateSystemSettingsDto) {
    return this.adminsService.updateSystemSettings(updateDto);
  }

  // ── Settings: Roles ───────────────────────────────────────────────────────

@Get('settings/admins/roles')
@ApiOperation({ summary: 'Get all admin roles' })
@ApiResponse({ status: 200, description: 'Roles fetched successfully' })
getRoles() {
  return this.adminsService.getRoles();
}

@Post('settings/admins/roles')
@ApiOperation({ summary: 'Create a new admin role' })
@ApiResponse({ status: 201, description: 'Role created successfully' })
@ApiResponse({ status: 409, description: 'Role already exists' })
createRole(@Body() createRoleDto: CreateRoleDto) {
  return this.adminsService.createRole(createRoleDto);
}

@Patch('settings/admins/roles/:id')
@ApiOperation({ summary: 'Update an admin role' })
@ApiResponse({ status: 200, description: 'Role updated successfully' })
@ApiResponse({ status: 404, description: 'Role not found' })
updateRole(
  @Param('id') id: string,
  @Body() updateRoleDto: UpdateRoleDto,
) {
  return this.adminsService.updateRole(id, updateRoleDto);
}

@Delete('settings/admins/roles/:id')
@ApiOperation({ summary: 'Delete an admin role' })
@ApiResponse({ status: 200, description: 'Role deleted successfully' })
@ApiResponse({ status: 404, description: 'Role not found' })
deleteRole(@Param('id') id: string) {
  return this.adminsService.deleteRole(id);
}

// ── Settings: Staff ───────────────────────────────────────────────────────

@Post('settings/admins/invite')
@ApiOperation({ summary: 'Invite a new staff member' })
@ApiResponse({ status: 201, description: 'Staff invited successfully' })
@ApiResponse({ status: 409, description: 'Email already exists' })
inviteStaff(
  @Body() inviteStaffDto: InviteStaffDto,
  @ActiveUser() activeUser: ActiveUserData,
) {
  return this.adminsService.inviteStaff(inviteStaffDto, activeUser.email);
}

  // ── Existing ──────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create admin profile' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['firstName', 'lastName', 'contact'],
      properties: {
        firstName: { type: 'string', example: 'Ama' },
        lastName: { type: 'string', example: 'Boateng' },
        contact: { type: 'string', example: '+233501234567' },
        location: { type: 'string', example: 'Accra' },
        role: { type: 'string', example: 'Super Admin' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Admin created successfully' })
  @ApiResponse({ status: 400, description: 'Validation or processing error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 504, description: 'Upstream users-service timeout' })
  create(@Body() createAdminDto: any) {
    return this.adminsService.create(createAdminDto);
  }

  // ── Settings: Profile ─────────────────────────────────────────────────────

  @Get('settings/profile')
  @ApiOperation({ summary: 'Get admin profile' })
  @ApiResponse({ status: 200, description: 'Profile fetched successfully' })
  getProfile(@ActiveUser() activeUser: ActiveUserData) {
    return this.adminsService.getProfile(activeUser.sub);
  }

  @Patch('settings/profile')
  @ApiOperation({ summary: 'Update admin profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  updateProfile(
    @ActiveUser() activeUser: ActiveUserData,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.adminsService.updateProfile(activeUser.sub, updateProfileDto);
  }

  @Post('settings/profile/photo')
  @ApiOperation({ summary: 'Upload admin profile photo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photo: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Photo uploaded successfully' })
  @UseInterceptors(FileInterceptor('photo'))
  async uploadProfilePhoto(
    @ActiveUser() activeUser: ActiveUserData,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const photoUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    return this.adminsService.updateProfilePhoto(activeUser.sub, photoUrl);
  }

  // ── Settings: Account ─────────────────────────────────────────────────────

  @Post('settings/account/change-password')
  @ApiOperation({ summary: 'Change admin password' })
  @ApiResponse({ status: 201, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Incorrect current password or passwords do not match' })
  changePassword(
    @ActiveUser() activeUser: ActiveUserData,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.adminsService.changePassword(activeUser.sub, changePasswordDto);
  }
}

/**
 * // apps/api-gateway/src/users/admins/admins.controller.ts
import { Delete, Param } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InviteStaffDto } from './dto/invite-staff.dto';

// ── Settings: Roles ───────────────────────────────────────────────────────

@Get('settings/admins/roles')
@ApiOperation({ summary: 'Get all admin roles' })
@ApiResponse({ status: 200, description: 'Roles fetched successfully' })
getRoles() {
  return this.adminsService.getRoles();
}

@Post('settings/admins/roles')
@ApiOperation({ summary: 'Create a new admin role' })
@ApiResponse({ status: 201, description: 'Role created successfully' })
@ApiResponse({ status: 409, description: 'Role already exists' })
createRole(@Body() createRoleDto: CreateRoleDto) {
  return this.adminsService.createRole(createRoleDto);
}

@Patch('settings/admins/roles/:id')
@ApiOperation({ summary: 'Update an admin role' })
@ApiResponse({ status: 200, description: 'Role updated successfully' })
@ApiResponse({ status: 404, description: 'Role not found' })
updateRole(
  @Param('id') id: string,
  @Body() updateRoleDto: UpdateRoleDto,
) {
  return this.adminsService.updateRole(id, updateRoleDto);
}

@Delete('settings/admins/roles/:id')
@ApiOperation({ summary: 'Delete an admin role' })
@ApiResponse({ status: 200, description: 'Role deleted successfully' })
@ApiResponse({ status: 404, description: 'Role not found' })
deleteRole(@Param('id') id: string) {
  return this.adminsService.deleteRole(id);
}

// ── Settings: Staff ───────────────────────────────────────────────────────

@Post('settings/admins/invite')
@ApiOperation({ summary: 'Invite a new staff member' })
@ApiResponse({ status: 201, description: 'Staff invited successfully' })
@ApiResponse({ status: 409, description: 'Email already exists' })
inviteStaff(
  @Body() inviteStaffDto: InviteStaffDto,
  @ActiveUser() activeUser: ActiveUserData,
) {
  return this.adminsService.inviteStaff(inviteStaffDto, activeUser.email);
}
 */

// import { Body, Controller, Post } from '@nestjs/common';
// import { AdminsService } from './admins.service';
// import {
//   ApiBearerAuth,
//   ApiBody,
//   ApiOperation,
//   ApiResponse,
//   ApiTags,
// } from '@nestjs/swagger';

// @ApiBearerAuth()
// @ApiTags('admins')
// @Controller('admins')
// export class AdminsController {
//   constructor(private readonly adminsService: AdminsService) {}

//   @Post()
//   @ApiOperation({ summary: 'Create admin profile' })
//   @ApiBody({
//     schema: {
//       type: 'object',
//       required: ['firstName', 'lastName', 'contact'],
//       properties: {
//         firstName: { type: 'string', example: 'Ama' },
//         lastName: { type: 'string', example: 'Boateng' },
//         contact: { type: 'string', example: '+233501234567' },
//         location: { type: 'string', example: 'Accra' },
//         role: { type: 'string', example: 'Super Admin' },
//       },
//     },
//     examples: {
//       createAdmin: {
//         summary: 'Admin payload',
//         value: {
//           firstName: 'Ama',
//           lastName: 'Boateng',
//           contact: '+233501234567',
//           location: 'Accra',
//           role: 'Super Admin',
//         },
//       },
//     },
//   })
//   @ApiResponse({
//     status: 201,
//     description: 'Admin created successfully',
//     schema: {
//       example: {
//         status: true,
//         message: 'Admin profile created successfully',
//         data: {
//           firstName: 'Ama',
//           lastName: 'Boateng',
//           contact: '+233501234567',
//           location: 'Accra',
//           role: 'Super Admin',
//         },
//       },
//     },
//   })
//   @ApiResponse({
//     status: 400,
//     description: 'Validation or processing error',
//     schema: {
//       example: {
//         message: 'Validation failed',
//         error: 'Bad Request',
//         statusCode: 400,
//       },
//     },
//   })
//   @ApiResponse({
//     status: 401,
//     description: 'Unauthorized',
//     schema: {
//       example: {
//         message: 'Unauthorized',
//         error: 'Unauthorized',
//         statusCode: 401,
//       },
//     },
//   })
//   @ApiResponse({
//     status: 504,
//     description: 'Upstream users-service timeout',
//     schema: {
//       example: {
//         message: 'Request to users-service timed out for pattern createAdmin',
//         error: 'Gateway Timeout',
//         statusCode: 504,
//       },
//     },
//   })
//   create(@Body() createAdminDto: any) {
//     return this.adminsService.create(createAdminDto);
//   }
// }

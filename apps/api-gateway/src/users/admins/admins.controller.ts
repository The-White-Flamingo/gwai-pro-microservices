import {
  ActiveUser,
  ActiveUserData,
  Auth,
  AuthType,
  ChangePasswordDto,
  Roles,
} from '@app/iam';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AdminsService } from './admins.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Role } from '@app/users';
import {
  coverVideoUploadOptions,
  ensureRequiredProfileFields,
  omitUndefinedFields,
  toCoverVideoPath,
  profilePictureUploadOptions,
  toProfilePicturePath,
} from '../profile-payload.util';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InviteStaffDto } from './dto/invite-staff.dto';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';

const adminProfileFilesInterceptor = FileFieldsInterceptor(
  [
    { name: 'profilePicture', maxCount: 1 },
    { name: 'coverVideo', maxCount: 1 },
  ],
  {
    limits: {
      fileSize: Math.max(
        profilePictureUploadOptions.limits.fileSize,
        coverVideoUploadOptions.limits.fileSize,
      ),
    },
    fileFilter: (req, file, callback) => {
      if (file.fieldname === 'coverVideo') {
        coverVideoUploadOptions.fileFilter(
          req,
          file as Express.Multer.File,
          callback,
        );
        return;
      }
      profilePictureUploadOptions.fileFilter(
        req,
        file as Express.Multer.File,
        callback,
      );
    },
    storage: {
      _handleFile(req, file, callback) {
        if (file.fieldname === 'coverVideo') {
          return (coverVideoUploadOptions.storage as any)._handleFile(
            req,
            file as any,
            callback,
          );
        }
        return (profilePictureUploadOptions.storage as any)._handleFile(
          req,
          file as any,
          callback,
        );
      },
      _removeFile(req, file, callback) {
        if (file.fieldname === 'coverVideo') {
          return (coverVideoUploadOptions.storage as any)._removeFile(
            req,
            file as any,
            callback,
          );
        }
        return (profilePictureUploadOptions.storage as any)._removeFile(
          req,
          file as any,
          callback,
        );
      },
    },
  },
);

@ApiBearerAuth()
@ApiTags('admins')
@Auth(AuthType.Bearer)
@Roles(Role.Admin)
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  @UseInterceptors(adminProfileFilesInterceptor)
  @ApiOperation({
    summary: 'Create admin profile',
    description:
      'Creates the authenticated admin profile. Profile picture is required. The route also accepts contact/location aliases from the merged admin implementation.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['profilePicture', 'firstName', 'lastName', 'phoneNumber'],
      properties: {
        profilePicture: {
          type: 'string',
          format: 'binary',
        },
        coverVideo: {
          type: 'string',
          format: 'binary',
        },
        firstName: { type: 'string', example: 'Ama' },
        lastName: { type: 'string', example: 'Boateng' },
        phoneNumber: { type: 'string', example: '+233501234567' },
        contact: { type: 'string', example: '+233501234567' },
        country: { type: 'string', example: 'Ghana' },
        address: { type: 'string', example: '123 Ring Road, Accra' },
        location: { type: 'string', example: 'Accra' },
        postalAddress: { type: 'string', example: 'P.O. Box CT 1234' },
        bio: {
          type: 'string',
          example: 'Platform operations and moderation.',
        },
        adminRoleName: { type: 'string', example: 'Super Admin' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Admin profile created successfully',
    schema: {
      example: {
        status: true,
        message: 'Admin profile created successfully',
        data: {
          id: '47e55c1c-0f02-48cc-b4d5-4f6aa66cd99d',
          profilePhoto:
            '/uploads/profile-pictures/7e2e5d0b-2da0-40ea-9838-42b8c2d87615.jpg',
          coverVideoPath: null,
          bio: 'Platform operations and moderation.',
          firstName: 'Ama',
          lastName: 'Boateng',
          phoneNumber: '+233501234567',
          contact: '+233501234567',
          country: 'Ghana',
          address: '123 Ring Road, Accra',
          location: 'Accra',
          postalAddress: 'P.O. Box CT 1234',
          role: 'Admin',
          adminRoleName: 'Super Admin',
          user: {
            id: '8746dd82-89f7-46e8-89dd-f81d7a68d4f9',
            email: 'ama@example.com',
            phoneNumber: '+233501234567',
          },
        },
      },
    },
  })
  create(
    @Body() createAdminDto: Record<string, unknown>,
    @UploadedFiles()
    files: {
      profilePicture?: Express.Multer.File[];
      coverVideo?: Express.Multer.File[];
    },
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    const payload = this.buildAdminProfilePayload(createAdminDto, files);
    ensureRequiredProfileFields(payload, [
      'profilePhoto',
      'firstName',
      'lastName',
      'phoneNumber',
    ]);

    return this.adminsService.create(payload, activeUser.sub);
  }

  @Get('settings/profile')
  @ApiOperation({ summary: 'Get current admin profile' })
  @ApiResponse({
    status: 200,
    description: 'Admin profile retrieved successfully',
  })
  getProfile(@ActiveUser() activeUser: ActiveUserData) {
    return this.adminsService.getProfile(activeUser.sub);
  }

  @Patch()
  @UseInterceptors(adminProfileFilesInterceptor)
  @ApiOperation({
    summary: 'Update admin profile',
    description:
      'Updates the authenticated admin profile. All fields are optional and omitted fields keep their current values.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        profilePicture: { type: 'string', format: 'binary' },
        coverVideo: { type: 'string', format: 'binary' },
        firstName: { type: 'string', example: 'Ama' },
        lastName: { type: 'string', example: 'Boateng' },
        phoneNumber: { type: 'string', example: '+233501234567' },
        contact: { type: 'string', example: '+233501234567' },
        country: { type: 'string', example: 'Ghana' },
        address: { type: 'string', example: '123 Ring Road, Accra' },
        location: { type: 'string', example: 'Accra' },
        postalAddress: { type: 'string', example: 'P.O. Box CT 1234' },
        bio: {
          type: 'string',
          example: 'Oversees platform operations and moderation.',
        },
        adminRoleName: { type: 'string', example: 'Ops Lead' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Admin profile updated successfully',
  })
  update(
    @Body() updateAdminDto: Record<string, unknown>,
    @UploadedFiles()
    files: {
      profilePicture?: Express.Multer.File[];
      coverVideo?: Express.Multer.File[];
    },
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.adminsService.update(
      this.buildAdminProfilePayload(updateAdminDto, files),
      activeUser.sub,
    );
  }

  @Patch('settings/profile')
  @UseInterceptors(adminProfileFilesInterceptor)
  @ApiOperation({
    summary: 'Update current admin profile via settings',
    description:
      'Alias of the admin profile update route for compatibility with the merged admin settings implementation.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        profilePicture: { type: 'string', format: 'binary' },
        coverVideo: { type: 'string', format: 'binary' },
        firstName: { type: 'string', example: 'Ama' },
        lastName: { type: 'string', example: 'Boateng' },
        phoneNumber: { type: 'string', example: '+233501234567' },
        contact: { type: 'string', example: '+233501234567' },
        country: { type: 'string', example: 'Ghana' },
        address: { type: 'string', example: '123 Ring Road, Accra' },
        location: { type: 'string', example: 'Accra' },
        postalAddress: { type: 'string', example: 'P.O. Box CT 1234' },
        bio: {
          type: 'string',
          example: 'Oversees platform operations and moderation.',
        },
        adminRoleName: { type: 'string', example: 'Ops Lead' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Admin profile updated successfully',
  })
  updateSettingsProfile(
    @Body() updateAdminDto: Record<string, unknown>,
    @UploadedFiles()
    files: {
      profilePicture?: Express.Multer.File[];
      coverVideo?: Express.Multer.File[];
    },
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.adminsService.update(
      this.buildAdminProfilePayload(updateAdminDto, files),
      activeUser.sub,
    );
  }

  @Get('settings/system')
  @ApiOperation({ summary: 'Get system settings' })
  @ApiResponse({
    status: 200,
    description: 'System settings retrieved successfully',
  })
  getSystemSettings() {
    return this.adminsService.getSystemSettings();
  }

  @Patch('settings/system')
  @ApiOperation({ summary: 'Update system settings' })
  @ApiResponse({
    status: 200,
    description: 'System settings updated successfully',
  })
  updateSystemSettings(@Body() updateDto: UpdateSystemSettingsDto) {
    return this.adminsService.updateSystemSettings(updateDto);
  }

  @Get('settings/admins/roles')
  @ApiOperation({ summary: 'Get admin role definitions' })
  @ApiResponse({
    status: 200,
    description: 'Admin roles retrieved successfully',
  })
  getRoles() {
    return this.adminsService.getRoles();
  }

  @Post('settings/admins/roles')
  @ApiOperation({ summary: 'Create an admin role' })
  @ApiResponse({
    status: 201,
    description: 'Admin role created successfully',
  })
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.adminsService.createRole(createRoleDto);
  }

  @Patch('settings/admins/roles/:id')
  @ApiOperation({ summary: 'Update an admin role' })
  @ApiParam({ name: 'id', example: 'b4aa9b93-dae0-49b9-b5f4-0859b8a4e8c5' })
  @ApiResponse({
    status: 200,
    description: 'Admin role updated successfully',
  })
  updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.adminsService.updateRole(id, updateRoleDto);
  }

  @Delete('settings/admins/roles/:id')
  @ApiOperation({ summary: 'Delete an admin role' })
  @ApiParam({ name: 'id', example: 'b4aa9b93-dae0-49b9-b5f4-0859b8a4e8c5' })
  @ApiResponse({
    status: 200,
    description: 'Admin role deleted successfully',
  })
  deleteRole(@Param('id') id: string) {
    return this.adminsService.deleteRole(id);
  }

  @Post('settings/admins/invite')
  @ApiOperation({ summary: 'Invite an admin staff member' })
  @ApiResponse({
    status: 201,
    description: 'Staff invited successfully',
    schema: {
      example: {
        status: true,
        message: 'Staff invited successfully',
        data: {
          admin: {
            id: '47e55c1c-0f02-48cc-b4d5-4f6aa66cd99d',
            firstName: 'Ama',
            lastName: 'Boateng',
            role: 'Admin',
            adminRoleName: 'Ops Lead',
            user: {
              id: '8746dd82-89f7-46e8-89dd-f81d7a68d4f9',
              email: 'ama.ops@gwaipro.com',
              phoneNumber: null,
            },
          },
          temporaryPassword: 'Temp@abc123xy1!',
        },
      },
    },
  })
  inviteStaff(
    @Body() inviteStaffDto: InviteStaffDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.adminsService.inviteStaff(inviteStaffDto, activeUser.sub);
  }

  @Post('change-password')
  @ApiOperation({
    summary: 'Change admin password',
    description:
      'Allows an authenticated admin to change their own password. Requires current password verification.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['currentPassword', 'newPassword'],
      properties: {
        currentPassword: {
          type: 'string',
          example: 'CurrentPassword123!',
        },
        newPassword: {
          type: 'string',
          example: 'NewPassword123!',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
  })
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.adminsService.changePassword(changePasswordDto, activeUser);
  }

  private buildAdminProfilePayload(
    body: Record<string, unknown>,
    files: {
      profilePicture?: Express.Multer.File[];
      coverVideo?: Express.Multer.File[];
    },
  ) {
    const profilePictureFile = files?.profilePicture?.[0] as
      | Express.Multer.File
      | undefined;
    const coverVideoFile = files?.coverVideo?.[0] as
      | Express.Multer.File
      | undefined;
    const payload = {
      ...body,
      phoneNumber:
        (body.phoneNumber as string | undefined) ??
        (body.contact as string | undefined),
      contact:
        (body.contact as string | undefined) ??
        (body.phoneNumber as string | undefined),
      address:
        (body.address as string | undefined) ??
        (body.location as string | undefined),
      location:
        (body.location as string | undefined) ??
        (body.address as string | undefined),
      adminRoleName:
        (body.adminRoleName as string | undefined) ??
        (body.role as string | undefined),
      profilePhoto: toProfilePicturePath(profilePictureFile),
      coverVideoPath: toCoverVideoPath(coverVideoFile),
    };

    return omitUndefinedFields(payload);
  }
}

import {
  ActiveUser,
  ActiveUserData,
  Auth,
  AuthType,
  ChangePasswordDto,
} from '@app/iam';
import {
  Body,
  Controller,
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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  coverVideoUploadOptions,
  ensureRequiredProfileFields,
  omitUndefinedFields,
  toCoverVideoPath,
  profilePictureUploadOptions,
  toProfilePicturePath,
} from '../profile-payload.util';

@ApiBearerAuth()
@ApiTags('admins')
@Auth(AuthType.Bearer)
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
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
            coverVideoUploadOptions.fileFilter(req, file as Express.Multer.File, callback);
            return;
          }
          profilePictureUploadOptions.fileFilter(req, file as Express.Multer.File, callback);
        },
        storage: {
          _handleFile(req, file, callback) {
            if (file.fieldname === 'coverVideo') {
              return (coverVideoUploadOptions.storage as any)._handleFile(req, file as any, callback);
            }
            return (profilePictureUploadOptions.storage as any)._handleFile(req, file as any, callback);
          },
          _removeFile(req, file, callback) {
            if (file.fieldname === 'coverVideo') {
              return (coverVideoUploadOptions.storage as any)._removeFile(req, file as any, callback);
            }
            return (profilePictureUploadOptions.storage as any)._removeFile(req, file as any, callback);
          },
        },
      },
    ),
  )
  @ApiOperation({
    summary: 'Create admin profile',
    description:
      'Creates the authenticated admin profile with contact details and uploads a profile picture to the server. Role is automatically set to Admin.',
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
          description: 'Admin profile picture (JPEG, PNG). Max 5MB.',
        },
        coverVideo: {
          type: 'string',
          format: 'binary',
          description: 'Optional admin cover video.',
        },
        firstName: {
          type: 'string',
          example: 'Ama',
          description: 'Admin first name.',
        },
        lastName: {
          type: 'string',
          example: 'Boateng',
          description: 'Admin last name.',
        },
        phoneNumber: {
          type: 'string',
          example: '+233501234567',
          description: 'Admin contact number in +0123456789',
        },
        country: {
          type: 'string',
          example: 'Ghana',
          description: 'Country (select from available countries list).',
        },
        address: {
          type: 'string',
          example: '123 Ring Road, Accra',
          description: 'Residential address.',
        },
        postalAddress: {
          type: 'string',
          example: 'P.O. Box CT 1234',
          description: 'Postal address.',
        },
        bio: {
          type: 'string',
          example: 'Platform operations and content moderation.',
        },
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
          firstName: 'Ama',
          lastName: 'Boateng',
          phoneNumber: '+233501234567',
          country: 'Ghana',
          address: '123 Ring Road, Accra',
          postalAddress: 'P.O. Box CT 1234',
          role: 'Admin',
          createdAt: '2026-04-11T10:30:00.000Z',
          updatedAt: '2026-04-11T10:30:00.000Z',
          user: {
            id: '8746dd82-89f7-46e8-89dd-f81d7a68d4f9',
            email: 'ama@example.com',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or invalid file upload',
    schema: {
      example: {
        message: 'Only image files are allowed for profile pictures',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        message: 'Unauthorized',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Authenticated user was not found',
    schema: {
      example: {
        message: 'User not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Admin profile already exists',
    schema: {
      example: {
        message: 'Admin profile already exists',
        error: 'Conflict',
        statusCode: 409,
      },
    },
  })
  @ApiResponse({
    status: 504,
    description: 'Upstream users-service timeout',
    schema: {
      example: {
        message: 'Request to users-service timed out for pattern createAdmin',
        error: 'Gateway Timeout',
        statusCode: 504,
      },
    },
  })
  create(
    @Body() createAdminDto: any,
    @UploadedFiles()
    files: { profilePicture?: Express.Multer.File[]; coverVideo?: Express.Multer.File[] },
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    const profilePictureFile = files?.profilePicture?.[0] as Express.Multer.File | undefined;
    const coverVideoFile = files?.coverVideo?.[0] as Express.Multer.File | undefined;
    const payload = {
      ...createAdminDto,
      profilePhoto: toProfilePicturePath(profilePictureFile),
      coverVideoPath: toCoverVideoPath(coverVideoFile),
    };

    ensureRequiredProfileFields(payload, [
      'profilePhoto',
      'firstName',
      'lastName',
      'phoneNumber',
    ]);

    return this.adminsService.create(
      payload,
      activeUser.sub,
    );
  }

  // @Patch()
  // @UseInterceptors(
  //   FileFieldsInterceptor(
  //     [
  //       { name: 'profilePicture', maxCount: 1 },
  //       { name: 'coverVideo', maxCount: 1 },
  //     ],
  //     {
  //       limits: {
  //         fileSize: Math.max(
  //           profilePictureUploadOptions.limits.fileSize,
  //           coverVideoUploadOptions.limits.fileSize,
  //         ),
  //       },
  //       fileFilter: (req, file, callback) => {
  //         if (file.fieldname === 'coverVideo') {
  //           coverVideoUploadOptions.fileFilter(req, file as Express.Multer.File, callback);
  //           return;
  //         }
  //         profilePictureUploadOptions.fileFilter(req, file as Express.Multer.File, callback);
  //       },
  //       storage: {
  //         _handleFile(req, file, callback) {
  //           if (file.fieldname === 'coverVideo') {
  //             return (coverVideoUploadOptions.storage as any)._handleFile(req, file as any, callback);
  //           }
  //           return (profilePictureUploadOptions.storage as any)._handleFile(req, file as any, callback);
  //         },
  //         _removeFile(req, file, callback) {
  //           if (file.fieldname === 'coverVideo') {
  //             return (coverVideoUploadOptions.storage as any)._removeFile(req, file as any, callback);
  //           }
  //           return (profilePictureUploadOptions.storage as any)._removeFile(req, file as any, callback);
  //         },
  //       },
  //     },
  //   ),
  // )
  // @ApiOperation({
  //   summary: 'Update admin profile',
  //   description:
  //     'Updates the authenticated admin profile. All fields are optional and omitted fields keep their current values.',
  // })
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       profilePicture: {
  //         type: 'string',
  //         format: 'binary',
  //       },
  //       coverVideo: {
  //         type: 'string',
  //         format: 'binary',
  //       },
  //       firstName: { type: 'string', example: 'Ama' },
  //       lastName: { type: 'string', example: 'Boateng' },
  //       phoneNumber: { type: 'string', example: '+233501234567' },
  //       country: { type: 'string', example: 'Ghana' },
  //       address: { type: 'string', example: '123 Ring Road, Accra' },
  //       postalAddress: { type: 'string', example: 'P.O. Box CT 1234' },
  //       bio: {
  //         type: 'string',
  //         example: 'Platform operations and content moderation.',
  //       },
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Admin profile updated successfully',
  //   schema: {
  //     example: {
  //       status: true,
  //       message: 'Admin profile updated successfully',
  //       data: {
  //         id: '47e55c1c-0f02-48cc-b4d5-4f6aa66cd99d',
  //         profilePhoto:
  //           '/uploads/profile-pictures/7e2e5d0b-2da0-40ea-9838-42b8c2d87615.jpg',
  //         coverVideoPath:
  //           '/uploads/cover-videos/8f12c950-c58e-4d49-a6cd-f42eef4d9f4c.mp4',
  //         firstName: 'Ama',
  //         lastName: 'Boateng',
  //         phoneNumber: '+233501234567',
  //         bio: 'Platform operations and content moderation.',
  //         role: 'Admin',
  //       },
  //     },
  //   },
  // })
  // update(
  //   @Body() updateAdminDto: any,
  //   @UploadedFiles()
  //   files: { profilePicture?: Express.Multer.File[]; coverVideo?: Express.Multer.File[] },
  //   @ActiveUser() activeUser: ActiveUserData,
  // ) {
  //   const profilePictureFile = files?.profilePicture?.[0] as Express.Multer.File | undefined;
  //   const coverVideoFile = files?.coverVideo?.[0] as Express.Multer.File | undefined;
  //   return this.adminsService.update(
  //     omitUndefinedFields({
  //       ...updateAdminDto,
  //       profilePhoto: toProfilePicturePath(profilePictureFile),
  //       coverVideoPath: toCoverVideoPath(coverVideoFile),
  //     }),
  //     activeUser.sub,
  //   );
  // }

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
          description: 'Current admin password (at least 8 characters, strong).',
        },
        newPassword: {
          type: 'string',
          example: 'NewPassword123!',
          description: 'New admin password (at least 8 characters, strong).',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: {
      example: {
        status: true,
        message: 'Password changed successfully.',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or invalid current password',
    schema: {
      example: {
        message: 'Current password is incorrect',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error (new password too weak)',
    schema: {
      example: {
        message: 'New password must be at least 8 characters',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 504,
    description: 'Upstream users-service timeout',
    schema: {
      example: {
        message: 'Request to users-service timed out for pattern auth.changePassword',
        error: 'Gateway Timeout',
        statusCode: 504,
      },
    },
  })
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.adminsService.changePassword(changePasswordDto, activeUser);
  }
}

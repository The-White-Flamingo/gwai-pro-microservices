import { ActiveUser, ActiveUserData, Auth, AuthType } from '@app/iam';
import {
  Body,
  Controller,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { MusiciansService } from './musicians.service';
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
  normalizeDateField,
  normalizeStringArrayField,
  toCoverVideoPath,
  profilePictureUploadOptions,
  toProfilePicturePath,
} from '../profile-payload.util';

@ApiBearerAuth()
@ApiTags('musicians')
@Auth(AuthType.Bearer)
@Controller('musicians')
export class MusiciansController {
  constructor(private readonly musiciansService: MusiciansService) {}

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
    summary: 'Create musician profile',
    description:
      'Creates the authenticated user musician profile and stores the uploaded profile picture on the server.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'firstName',
        'lastName',
        'username',
        'phone',
        'dateOfBirth',
        'address',
        'rate',
        'interests',
        'genres',
        'profilePicture',
      ],
      properties: {
        firstName: { type: 'string', example: 'Kojo' },
        lastName: { type: 'string', example: 'Asare' },
        username: { type: 'string', example: 'kojo_asare' },
        phone: { type: 'string', example: '+233241112233' },
        dateOfBirth: {
          type: 'string',
          format: 'date-time',
          example: '1998-03-22T00:00:00.000Z',
        },
        address: { type: 'string', example: 'Kumasi' },
        rate: { type: 'string', example: '500 GHS per session' },
        interests: {
          type: 'string',
          example: '["Songwriting","Live Performance"]',
        },
        genres: {
          type: 'string',
          example: '["Afrobeats","Highlife"]',
        },
        profilePicture: {
          type: 'string',
          format: 'binary',
        },
        coverVideo: {
          type: 'string',
          format: 'binary',
        },
        bio: { type: 'string', example: 'Session bassist and arranger.' },
        paymentMethodType: { type: 'string', example: 'momo' },
        bankName: { type: 'string', example: 'GCB Bank' },
        bankAccountNumber: { type: 'string', example: '0123456789' },
        bankAccountName: { type: 'string', example: 'Kojo Asare' },
        mobileMoneyNetworkProvider: { type: 'string', example: 'MTN' },
        mobileMoneyPhoneNumber: { type: 'string', example: '+233241112233' },
        mobileMoneyAccountName: { type: 'string', example: 'Kojo Asare' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Musician created successfully',
    schema: {
      example: {
        status: true,
        message: 'Musician profile created successfully',
        data: {
          id: '3d2f64b7-5e78-488d-8663-f12131ccda39',
          firstName: 'Kojo',
          lastName: 'Asare',
          username: 'kojo_asare',
          phone: '+233241112233',
          dateOfBirth: '1998-03-22T00:00:00.000Z',
          address: 'Kumasi',
          rate: '500 GHS per session',
          interests: ['Songwriting', 'Live Performance'],
          genres: ['Afrobeats', 'Highlife'],
          profilePicturePath:
            '/uploads/profile-pictures/5c26968d-91dd-438e-b77b-5f8c1d9fae9d.png',
          createdAt: '2026-03-28T09:00:00.000Z',
          updatedAt: '2026-03-28T09:00:00.000Z',
          user: {
            id: 'e10f6b2c-3d58-4c87-84fd-beff956831c9',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation or processing error',
    schema: {
      example: {
        message: 'Validation failed',
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
    description: 'Musician profile or user identity conflict',
    schema: {
      example: {
        message: 'Username already exists',
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
        message:
          'Request to users-service timed out for pattern createMusician',
        error: 'Gateway Timeout',
        statusCode: 504,
      },
    },
  })
  create(
    @Body() createMusicianDto: any,
    @UploadedFiles()
    files: { profilePicture?: Express.Multer.File[]; coverVideo?: Express.Multer.File[] },
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    const profilePictureFile = files?.profilePicture?.[0] as Express.Multer.File | undefined;
    const coverVideoFile = files?.coverVideo?.[0] as Express.Multer.File | undefined;
    const payload = {
      ...createMusicianDto,
      dateOfBirth: normalizeDateField(createMusicianDto.dateOfBirth),
      interests: normalizeStringArrayField(createMusicianDto.interests),
      genres: normalizeStringArrayField(createMusicianDto.genres),
      profilePicturePath: toProfilePicturePath(profilePictureFile),
      coverVideoPath: toCoverVideoPath(coverVideoFile),
    };

    ensureRequiredProfileFields(payload, [
      'firstName',
      'lastName',
      'username',
      'phone',
      'dateOfBirth',
      'address',
      'rate',
      'interests',
      'genres',
      'profilePicturePath',
    ]);

    return this.musiciansService.create(
      payload,
      activeUser.sub,
    );
  }

  @Patch()
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
    summary: 'Update musician profile',
    description:
      'Updates the authenticated user musician profile. Only the current authenticated musician profile is modified.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string', example: 'Kojo' },
        lastName: { type: 'string', example: 'Asare' },
        username: { type: 'string', example: 'kojo_asare' },
        phone: { type: 'string', example: '+233241112233' },
        dateOfBirth: {
          type: 'string',
          format: 'date-time',
          example: '1998-03-22T00:00:00.000Z',
        },
        address: { type: 'string', example: 'Accra' },
        rate: { type: 'string', example: '650 GHS per session' },
        interests: {
          type: 'string',
          example: '["Songwriting","Touring"]',
        },
        genres: {
          type: 'string',
          example: '["Afrobeats","Amapiano"]',
        },
        profilePicture: {
          type: 'string',
          format: 'binary',
        },
        coverVideo: {
          type: 'string',
          format: 'binary',
        },
        bio: {
          type: 'string',
          example: 'Session bassist and arranger.',
        },
        paymentMethodType: { type: 'string', example: 'bank' },
        bankName: { type: 'string', example: 'GCB Bank' },
        bankAccountNumber: { type: 'string', example: '0123456789' },
        bankAccountName: { type: 'string', example: 'Kojo Asare' },
        mobileMoneyNetworkProvider: { type: 'string', example: 'MTN' },
        mobileMoneyPhoneNumber: { type: 'string', example: '+233241112233' },
        mobileMoneyAccountName: { type: 'string', example: 'Kojo Asare' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Musician updated successfully',
    schema: {
      example: {
        status: true,
        message: 'Musician profile updated successfully',
        data: {
          id: '3d2f64b7-5e78-488d-8663-f12131ccda39',
          firstName: 'Kojo',
          lastName: 'Asare',
          username: 'kojo_asare',
          phone: '+233241112233',
          dateOfBirth: '1998-03-22T00:00:00.000Z',
          address: 'Accra',
          rate: '650 GHS per session',
          interests: ['Songwriting', 'Touring'],
          genres: ['Afrobeats', 'Amapiano'],
          profilePicturePath:
            '/uploads/profile-pictures/5c26968d-91dd-438e-b77b-5f8c1d9fae9d.png',
          createdAt: '2026-03-28T09:00:00.000Z',
          updatedAt: '2026-03-28T09:30:00.000Z',
          user: {
            id: 'e10f6b2c-3d58-4c87-84fd-beff956831c9',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation or processing error',
    schema: {
      example: {
        message: 'Validation failed',
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
    description: 'Musician profile not found',
    schema: {
      example: {
        message: 'Musician profile not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'User identity conflict',
    schema: {
      example: {
        message: 'Phone number already exists',
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
        message:
          'Request to users-service timed out for pattern updateMusicianProfile',
        error: 'Gateway Timeout',
        statusCode: 504,
      },
    },
  })
  update(
    @Body() updateMusicianDto: any,
    @ActiveUser() activeUser: ActiveUserData,
    @UploadedFiles()
    files?: { profilePicture?: Express.Multer.File[]; coverVideo?: Express.Multer.File[] },
  ) {
    const profilePictureFile = files?.profilePicture?.[0] as Express.Multer.File | undefined;
    const coverVideoFile = files?.coverVideo?.[0] as Express.Multer.File | undefined;
    return this.musiciansService.update(
      omitUndefinedFields({
        ...updateMusicianDto,
        dateOfBirth: normalizeDateField(updateMusicianDto.dateOfBirth),
        interests: normalizeStringArrayField(updateMusicianDto.interests),
        genres: normalizeStringArrayField(updateMusicianDto.genres),
        profilePicturePath: toProfilePicturePath(profilePictureFile),
        coverVideoPath: toCoverVideoPath(coverVideoFile),
      }),
      activeUser.sub,
    );
  }
}

import { ActiveUser, ActiveUserData, Auth, AuthType } from '@app/iam';
import {
  Body,
  Controller,
  Patch,
  Post,
  UploadedFile,
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
import { FileInterceptor } from '@nestjs/platform-express';
import {
  normalizeStringArrayField,
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
    FileInterceptor('profilePicture', profilePictureUploadOptions),
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
    @UploadedFile() file: Express.Multer.File,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.musiciansService.create(
      {
        ...createMusicianDto,
        interests: normalizeStringArrayField(createMusicianDto.interests),
        genres: normalizeStringArrayField(createMusicianDto.genres),
        profilePicturePath: toProfilePicturePath(file),
      },
      activeUser.sub,
    );
  }

  @Patch()
  @ApiOperation({
    summary: 'Update musician profile',
    description:
      'Updates the authenticated user musician profile. Only the current authenticated musician profile is modified.',
  })
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
          type: 'array',
          items: { type: 'string' },
          example: ['Songwriting', 'Touring'],
        },
        genres: {
          type: 'array',
          items: { type: 'string' },
          example: ['Afrobeats', 'Amapiano'],
        },
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
  ) {
    return this.musiciansService.update(
      {
        ...updateMusicianDto,
        interests:
          normalizeStringArrayField(updateMusicianDto.interests) ??
          updateMusicianDto.interests,
        genres:
          normalizeStringArrayField(updateMusicianDto.genres) ??
          updateMusicianDto.genres,
      },
      activeUser.sub,
    );
  }
}

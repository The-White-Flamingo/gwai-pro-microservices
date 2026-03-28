import { ActiveUser, ActiveUserData, Auth, AuthType } from '@app/iam';
import {
  Body,
  Controller,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { StudiosService } from './studios.service';
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
@ApiTags('studios')
@Auth(AuthType.Bearer)
@Controller('studios')
export class StudiosController {
  constructor(private readonly studiosService: StudiosService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('profilePicture', profilePictureUploadOptions),
  )
  @ApiOperation({
    summary: 'Create studio profile',
    description:
      'Creates the authenticated user studio profile and stores the uploaded profile picture on the server.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'name',
        'username',
        'phone',
        'address',
        'rate',
        'services',
        'equipment',
      ],
      properties: {
        name: { type: 'string', example: 'Echo Chamber Studios' },
        username: { type: 'string', example: 'echo_chamber' },
        phone: { type: 'string', example: '+233201998877' },
        address: { type: 'string', example: 'East Legon, Accra' },
        rate: { type: 'string', example: '1200 GHS per session' },
        services: {
          type: 'string',
          example: '["Mixing","Mastering"]',
        },
        equipment: {
          type: 'string',
          example: '["Neumann U87","Apollo Twin X"]',
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
    description: 'Studio created successfully',
    schema: {
      example: {
        status: true,
        message: 'Studio profile created successfully',
        data: {
          id: '6de4d210-d2d4-4eb8-a9c2-db8b44c8a7d6',
          name: 'Echo Chamber Studios',
          username: 'echo_chamber',
          phone: '+233201998877',
          address: 'East Legon, Accra',
          rate: '1200 GHS per session',
          services: ['Mixing', 'Mastering'],
          equipment: ['Neumann U87', 'Apollo Twin X'],
          profilePicturePath:
            '/uploads/profile-pictures/d6efe0f4-e962-4dfd-a966-5f3f79cfb5ba.jpg',
          createdAt: '2026-03-28T09:00:00.000Z',
          updatedAt: '2026-03-28T09:00:00.000Z',
          user: {
            id: '4c48720f-4f8c-4991-9ef5-696d40f12345',
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
    description: 'Studio profile or user identity conflict',
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
        message: 'Request to users-service timed out for pattern createStudio',
        error: 'Gateway Timeout',
        statusCode: 504,
      },
    },
  })
  create(
    @Body() createStudioDto: any,
    @UploadedFile() file: Express.Multer.File,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.studiosService.create(
      {
        ...createStudioDto,
        services: normalizeStringArrayField(createStudioDto.services),
        equipment: normalizeStringArrayField(createStudioDto.equipment),
        profilePicturePath: toProfilePicturePath(file),
      },
      activeUser.sub,
    );
  }

  @Patch()
  @ApiOperation({
    summary: 'Update studio profile',
    description:
      'Updates the authenticated user studio profile. Only the current authenticated studio profile is modified.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Echo Chamber Studios' },
        username: { type: 'string', example: 'echo_chamber' },
        phone: { type: 'string', example: '+233201998877' },
        address: { type: 'string', example: 'Osu, Accra' },
        rate: { type: 'string', example: '1500 GHS per session' },
        services: {
          type: 'array',
          items: { type: 'string' },
          example: ['Recording', 'Mixing', 'Mastering'],
        },
        equipment: {
          type: 'array',
          items: { type: 'string' },
          example: ['Neumann U87', 'Apollo Twin X', 'Yamaha HS8'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Studio updated successfully',
    schema: {
      example: {
        status: true,
        message: 'Studio profile updated successfully',
        data: {
          id: '6de4d210-d2d4-4eb8-a9c2-db8b44c8a7d6',
          name: 'Echo Chamber Studios',
          username: 'echo_chamber',
          phone: '+233201998877',
          address: 'Osu, Accra',
          rate: '1500 GHS per session',
          services: ['Recording', 'Mixing', 'Mastering'],
          equipment: ['Neumann U87', 'Apollo Twin X', 'Yamaha HS8'],
          profilePicturePath:
            '/uploads/profile-pictures/d6efe0f4-e962-4dfd-a966-5f3f79cfb5ba.jpg',
          createdAt: '2026-03-28T09:00:00.000Z',
          updatedAt: '2026-03-28T09:30:00.000Z',
          user: {
            id: '4c48720f-4f8c-4991-9ef5-696d40f12345',
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
    description: 'Studio profile not found',
    schema: {
      example: {
        message: 'Studio profile not found',
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
          'Request to users-service timed out for pattern updateStudioProfile',
        error: 'Gateway Timeout',
        statusCode: 504,
      },
    },
  })
  update(
    @Body() updateStudioDto: any,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.studiosService.update(
      {
        ...updateStudioDto,
        services:
          normalizeStringArrayField(updateStudioDto.services) ??
          updateStudioDto.services,
        equipment:
          normalizeStringArrayField(updateStudioDto.equipment) ??
          updateStudioDto.equipment,
      },
      activeUser.sub,
    );
  }
}

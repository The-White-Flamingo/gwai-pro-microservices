import { ActiveUser, ActiveUserData, Auth, AuthType } from '@app/iam';
import { Body, Controller, Patch, Post } from '@nestjs/common';
import { StudiosService } from './studios.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('studios')
@Auth(AuthType.Bearer)
@Controller('studios')
export class StudiosController {
  constructor(private readonly studiosService: StudiosService) {}

  @Post()
  @ApiOperation({
    summary: 'Create studio profile',
    description:
      'Creates the authenticated user studio profile. Use the bearer token returned from OTP verification.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'contact', 'location', 'services'],
      properties: {
        name: { type: 'string', example: 'Echo Chamber Studios' },
        contact: { type: 'string', example: '+233201998877' },
        location: { type: 'string', example: 'East Legon, Accra' },
        services: {
          type: 'array',
          items: { type: 'string' },
          example: ['Mixing', 'Mastering'],
        },
      },
    },
    examples: {
      createStudio: {
        summary: 'Studio payload',
        value: {
          name: 'Echo Chamber Studios',
          contact: '+233201998877',
          location: 'East Legon, Accra',
          services: ['Mixing', 'Mastering'],
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
          contact: '+233201998877',
          location: 'East Legon, Accra',
          services: ['Mixing', 'Mastering'],
          createdAt: '2026-03-26T10:30:00.000Z',
          updatedAt: '2026-03-26T10:30:00.000Z',
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
    description: 'Studio profile already exists',
    schema: {
      example: {
        message: 'Studio profile already exists',
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
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.studiosService.create(createStudioDto, activeUser.sub);
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
        contact: { type: 'string', example: '+233201998877' },
        location: { type: 'string', example: 'East Legon, Accra' },
        services: {
          type: 'array',
          items: { type: 'string' },
          example: ['Mixing', 'Mastering'],
        },
      },
    },
    examples: {
      updateStudio: {
        summary: 'Studio update payload',
        value: {
          location: 'Osu, Accra',
          services: ['Recording', 'Mixing', 'Mastering'],
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
          contact: '+233201998877',
          location: 'Osu, Accra',
          services: ['Recording', 'Mixing', 'Mastering'],
          createdAt: '2026-03-26T10:30:00.000Z',
          updatedAt: '2026-03-26T12:15:00.000Z',
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
    return this.studiosService.update(updateStudioDto, activeUser.sub);
  }
}

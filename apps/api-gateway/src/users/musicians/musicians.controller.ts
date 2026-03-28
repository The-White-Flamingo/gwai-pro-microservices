import { ActiveUser, ActiveUserData, Auth, AuthType } from '@app/iam';
import { Body, Controller, Patch, Post } from '@nestjs/common';
import { MusiciansService } from './musicians.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('musicians')
@Auth(AuthType.Bearer)
@Controller('musicians')
export class MusiciansController {
  constructor(private readonly musiciansService: MusiciansService) {}

  @Post()
  @ApiOperation({
    summary: 'Create musician profile',
    description:
      'Creates the authenticated user musician profile. Use the bearer token returned from OTP verification.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'firstName',
        'lastName',
        'contact',
        'dateOfBirth',
        'genres',
        'interests',
      ],
      properties: {
        firstName: { type: 'string', example: 'Kojo' },
        lastName: { type: 'string', example: 'Asare' },
        contact: { type: 'string', example: '+233241112233' },
        dateOfBirth: {
          type: 'string',
          format: 'date-time',
          example: '1998-03-22T00:00:00.000Z',
        },
        genres: {
          type: 'array',
          items: { type: 'string' },
          example: ['Afrobeats', 'Highlife'],
        },
        interests: {
          type: 'array',
          items: { type: 'string' },
          example: ['Songwriting', 'Live Performance'],
        },
      },
    },
    examples: {
      createMusician: {
        summary: 'Musician payload',
        value: {
          firstName: 'Kojo',
          lastName: 'Asare',
          contact: '+233241112233',
          dateOfBirth: '1998-03-22T00:00:00.000Z',
          genres: ['Afrobeats', 'Highlife'],
          interests: ['Songwriting', 'Live Performance'],
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
          contact: '+233241112233',
          location: 'Kumasi',
          dateOfBirth: '1998-03-22T00:00:00.000Z',
          genres: ['Afrobeats', 'Highlife'],
          interests: ['Songwriting', 'Live Performance'],
          createdAt: '2026-03-26T10:30:00.000Z',
          updatedAt: '2026-03-26T10:30:00.000Z',
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
    description: 'Musician profile already exists',
    schema: {
      example: {
        message: 'Musician profile already exists',
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
        message: 'Request to users-service timed out for pattern createMusician',
        error: 'Gateway Timeout',
        statusCode: 504,
      },
    },
  })
  create(
    @Body() createMusicianDto: any,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.musiciansService.create(createMusicianDto, activeUser.sub);
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
        contact: { type: 'string', example: '+233241112233' },
        location: { type: 'string', example: 'Kumasi' },
        dateOfBirth: {
          type: 'string',
          format: 'date-time',
          example: '1998-03-22T00:00:00.000Z',
        },
        genres: {
          type: 'array',
          items: { type: 'string' },
          example: ['Afrobeats', 'Highlife'],
        },
        interests: {
          type: 'array',
          items: { type: 'string' },
          example: ['Songwriting', 'Live Performance'],
        },
      },
    },
    examples: {
      updateMusician: {
        summary: 'Musician update payload',
        value: {
          location: 'Accra',
          genres: ['Afrobeats', 'Amapiano'],
          interests: ['Songwriting', 'Touring'],
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
          contact: '+233241112233',
          location: 'Accra',
          dateOfBirth: '1998-03-22T00:00:00.000Z',
          genres: ['Afrobeats', 'Amapiano'],
          interests: ['Songwriting', 'Touring'],
          createdAt: '2026-03-26T10:30:00.000Z',
          updatedAt: '2026-03-26T12:15:00.000Z',
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
    return this.musiciansService.update(updateMusicianDto, activeUser.sub);
  }
}

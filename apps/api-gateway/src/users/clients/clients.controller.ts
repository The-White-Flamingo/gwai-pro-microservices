import { ActiveUser, ActiveUserData, Auth, AuthType } from '@app/iam';
import { Body, Controller, Patch, Post } from '@nestjs/common';
import { ClientsService } from './clients.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('clients')
@Auth(AuthType.Bearer)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create client profile',
    description:
      'Creates the authenticated user client profile. Use the bearer token returned from OTP verification.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'firstName',
        'lastName',
        'contact',
        'location',
        'dateOfBirth',
        'genres',
        'interests',
      ],
      properties: {
        firstName: { type: 'string', example: 'Kwame' },
        lastName: { type: 'string', example: 'Mensah' },
        contact: { type: 'string', example: '+233201234567' },
        dateOfBirth: {
          type: 'string',
          format: 'date-time',
          example: '1997-08-14T00:00:00.000Z',
        },
        genres: {
          type: 'array',
          items: { type: 'string' },
          example: ['Gospel', 'Hip Hop'],
        },
        interests: {
          type: 'array',
          items: { type: 'string' },
          example: ['Music Production', 'Live Performance'],
        },
      },
    },
    examples: {
      createClient: {
        summary: 'Client payload',
        value: {
          firstName: 'Kwame',
          lastName: 'Mensah',
          contact: '+233201234567',
          dateOfBirth: '1997-08-14T00:00:00.000Z',
          genres: ['Gospel', 'Hip Hop'],
          interests: ['Music Production', 'Live Performance'],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Client created successfully',
    schema: {
      example: {
        status: true,
        message: 'Client profile created successfully',
        data: {
          id: 'd51ae9b1-70dd-43d7-98e2-72e45d8cb7fe',
          firstName: 'Kwame',
          lastName: 'Mensah',
          contact: '+233201234567',
          location: 'Tema, Accra',
          dateOfBirth: '1997-08-14T00:00:00.000Z',
          genres: ['Gospel', 'Hip Hop'],
          interests: ['Music Production', 'Live Performance'],
          user: {
            id: '0b542e13-b426-456d-a615-1d2c1c3b8a31',
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
    description: 'Client profile already exists',
    schema: {
      example: {
        message: 'Client profile already exists',
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
        message: 'Request to users-service timed out for pattern createClient',
        error: 'Gateway Timeout',
        statusCode: 504,
      },
    },
  })
  create(
    @Body() createClientDto: any,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.clientsService.create(createClientDto, activeUser.sub);
  }

  @Patch()
  @ApiOperation({
    summary: 'Update client profile',
    description:
      'Updates the authenticated user client profile. Only the current authenticated client profile is modified.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string', example: 'Kwame' },
        lastName: { type: 'string', example: 'Mensah' },
        contact: { type: 'string', example: '+233201234567' },
        location: { type: 'string', example: 'Tema, Accra' },
        dateOfBirth: {
          type: 'string',
          format: 'date-time',
          example: '1997-08-14T00:00:00.000Z',
        },
        genres: {
          type: 'array',
          items: { type: 'string' },
          example: ['Gospel', 'Hip Hop'],
        },
        interests: {
          type: 'array',
          items: { type: 'string' },
          example: ['Music Production', 'Live Performance'],
        },
      },
    },
    examples: {
      updateClient: {
        summary: 'Client update payload',
        value: {
          location: 'Tema, Accra',
          genres: ['Gospel', 'Jazz'],
          interests: ['Music Production', 'Songwriting'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Client updated successfully',
    schema: {
      example: {
        status: true,
        message: 'Client profile updated successfully',
        data: {
          id: 'd51ae9b1-70dd-43d7-98e2-72e45d8cb7fe',
          firstName: 'Kwame',
          lastName: 'Mensah',
          contact: '+233201234567',
          location: 'Tema, Accra',
          dateOfBirth: '1997-08-14T00:00:00.000Z',
          genres: ['Gospel', 'Jazz'],
          interests: ['Music Production', 'Songwriting'],
          user: {
            id: '0b542e13-b426-456d-a615-1d2c1c3b8a31',
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
    description: 'Client profile not found',
    schema: {
      example: {
        message: 'Client profile not found',
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
          'Request to users-service timed out for pattern updateClientProfile',
        error: 'Gateway Timeout',
        statusCode: 504,
      },
    },
  })
  update(
    @Body() updateClientDto: any,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.clientsService.update(updateClientDto, activeUser.sub);
  }
}

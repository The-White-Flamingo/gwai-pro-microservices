import { Body, Controller, Post } from '@nestjs/common';
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
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create client profile' })
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
    status: 400,
    description: 'Validation or processing error',
    schema: {
      example: {
        message: 'Request to users-service timed out for pattern createClient',
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
  create(@Body() createClientDto: any) {
    return this.clientsService.create(createClientDto);
  }
}

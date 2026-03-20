import { Body, Controller, Post } from '@nestjs/common';
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
@Controller('musicians')
export class MusiciansController {
  constructor(private readonly musiciansService: MusiciansService) {}

  @Post()
  @ApiOperation({ summary: 'Create musician profile' })
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
  create(@Body() createMusicianDto: any) {
    return this.musiciansService.create(createMusicianDto);
  }
}

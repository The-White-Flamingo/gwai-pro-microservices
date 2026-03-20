import { Body, Controller, Post } from '@nestjs/common';
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
@Controller('studios')
export class StudiosController {
  constructor(private readonly studiosService: StudiosService) {}

  @Post()
  @ApiOperation({ summary: 'Create studio profile' })
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
          name: 'Echo Chamber Studios',
          contact: '+233201998877',
          location: 'East Legon, Accra',
          services: ['Mixing', 'Mastering'],
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
        message: 'Request to users-service timed out for pattern createStudio',
        error: 'Gateway Timeout',
        statusCode: 504,
      },
    },
  })
  create(@Body() createStudioDto: any) {
    return this.studiosService.create(createStudioDto);
  }
}

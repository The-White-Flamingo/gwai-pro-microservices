import { Body, Controller, Post } from '@nestjs/common';
import { AdminsService } from './admins.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('admins')
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  @ApiOperation({ summary: 'Create admin profile' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['firstName', 'lastName', 'contact'],
      properties: {
        firstName: { type: 'string', example: 'Ama' },
        lastName: { type: 'string', example: 'Boateng' },
        contact: { type: 'string', example: '+233501234567' },
        location: { type: 'string', example: 'Accra' },
        role: { type: 'string', example: 'Super Admin' },
      },
    },
    examples: {
      createAdmin: {
        summary: 'Admin payload',
        value: {
          firstName: 'Ama',
          lastName: 'Boateng',
          contact: '+233501234567',
          location: 'Accra',
          role: 'Super Admin',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Admin created successfully',
    schema: {
      example: {
        status: true,
        message: 'Admin profile created successfully',
        data: {
          firstName: 'Ama',
          lastName: 'Boateng',
          contact: '+233501234567',
          location: 'Accra',
          role: 'Super Admin',
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
        message: 'Request to users-service timed out for pattern createAdmin',
        error: 'Gateway Timeout',
        statusCode: 504,
      },
    },
  })
  create(@Body() createAdminDto: any) {
    return this.adminsService.create(createAdminDto);
  }
}

import { ActiveUser, ActiveUserData, Auth, AuthType } from '@app/iam';
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
@Auth(AuthType.Bearer)
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create admin profile',
    description:
      'Creates the authenticated user admin profile. Use the bearer token returned from OTP verification.',
  })
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
          id: '47e55c1c-0f02-48cc-b4d5-4f6aa66cd99d',
          firstName: 'Ama',
          lastName: 'Boateng',
          contact: '+233501234567',
          location: 'Accra',
          role: 'Super Admin',
          createdAt: '2026-03-26T10:30:00.000Z',
          updatedAt: '2026-03-26T10:30:00.000Z',
          user: {
            id: '8746dd82-89f7-46e8-89dd-f81d7a68d4f9',
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
    description: 'Admin profile already exists',
    schema: {
      example: {
        message: 'Admin profile already exists',
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
        message: 'Request to users-service timed out for pattern createAdmin',
        error: 'Gateway Timeout',
        statusCode: 504,
      },
    },
  })
  create(
    @Body() createAdminDto: any,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.adminsService.create(createAdminDto, activeUser.sub);
  }
}

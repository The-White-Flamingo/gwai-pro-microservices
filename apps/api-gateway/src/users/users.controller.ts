import {
  ActiveUser,
  ActiveUserData,
  Roles,
} from '@app/iam';
import { UpdateUserDto } from '@app/users';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private static readonly adminRole = 'Admin' as any;
  private static readonly allUserRoles = [
    'Client',
    'Musician',
    'Studio',
    'Admin',
  ] as any;

  @Get('me')
  @Roles(...UsersController.allUserRoles)
  @ApiOperation({
    summary: 'Fetch current authenticated user',
    description:
      'Returns the authenticated user and their attached role profile if one exists.',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user fetched successfully',
    schema: {
      example: {
        status: true,
        message: 'Current user fetched successfully',
        data: {
          user: {
            id: 'e10f6b2c-3d58-4c87-84fd-beff956831c9',
            email: 'jane@example.com',
            username: 'jane_doe',
            phoneNumber: '+233201234567',
            role: 'Musician',
            googleId: null,
            appleId: null,
          },
          profileType: 'Musician',
          profile: {
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
              email: 'jane@example.com',
              username: 'jane_doe',
              phoneNumber: '+233201234567',
              role: 'Musician',
              googleId: null,
              appleId: null,
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid bearer token',
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
    description: 'Authenticated user not found',
    schema: {
      example: {
        message: 'User not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  me(@ActiveUser() activeUser: ActiveUserData) {
    return this.usersService.me(activeUser.sub);
  }

  @Get()
  @Roles(UsersController.adminRole)
  @ApiOperation({
    summary: 'Fetch all users',
    description: 'Admin-only route that returns all users in the users table.',
  })
  @ApiResponse({
    status: 200,
    description: 'Users fetched successfully',
    schema: {
      example: {
        status: true,
        message: 'Users fetched successfully',
        data: [
          {
            id: 'e10f6b2c-3d58-4c87-84fd-beff956831c9',
            email: 'jane@example.com',
            username: 'jane_doe',
            phoneNumber: '+233201234567',
            role: 'Musician',
            googleId: null,
            appleId: null,
          },
        ],
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
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(UsersController.adminRole)
  @ApiOperation({
    summary: 'Fetch one user by id',
    description: 'Admin-only route that returns one user from the users table.',
  })
  @ApiParam({
    name: 'id',
    example: 'e10f6b2c-3d58-4c87-84fd-beff956831c9',
  })
  @ApiResponse({
    status: 200,
    description: 'User fetched successfully',
    schema: {
      example: {
        status: true,
        message: 'User fetched successfully',
        data: {
          id: 'e10f6b2c-3d58-4c87-84fd-beff956831c9',
          email: 'jane@example.com',
          username: 'jane_doe',
          phoneNumber: '+233201234567',
          role: 'Musician',
          googleId: null,
          appleId: null,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        message: 'User not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UsersController.adminRole)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Update user by id',
    description:
      'Admin-only route that updates a user record. You can update email, username, phone number, and role.',
  })
  @ApiParam({
    name: 'id',
    example: 'e10f6b2c-3d58-4c87-84fd-beff956831c9',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', example: 'newmail@example.com' },
        username: { type: 'string', example: 'new_username' },
        phoneNumber: { type: 'string', example: '+233501112233' },
        role: { type: 'string', example: 'Client' },
      },
    },
    examples: {
      updateUser: {
        summary: 'User update payload',
        value: {
          username: 'new_username',
          phoneNumber: '+233501112233',
          role: 'Client',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    schema: {
      example: {
        status: true,
        message: 'User updated successfully',
        data: {
          id: 'e10f6b2c-3d58-4c87-84fd-beff956831c9',
          email: 'jane@example.com',
          username: 'new_username',
          phoneNumber: '+233501112233',
          role: 'Client',
          googleId: null,
          appleId: null,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
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
    description: 'Unique user field conflict',
    schema: {
      example: {
        message: 'Email, username, or phone number already exists',
        error: 'Conflict',
        statusCode: 409,
      },
    },
  })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: Omit<UpdateUserDto, 'id'>,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // updateUserDto.avatar = file?.buffer.toString('base64');
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UsersController.adminRole)
  @ApiOperation({
    summary: 'Delete user by id',
    description: 'Admin-only route that deletes a user record.',
  })
  @ApiParam({
    name: 'id',
    example: 'e10f6b2c-3d58-4c87-84fd-beff956831c9',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    schema: {
      example: {
        status: true,
        message: 'User deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        message: 'User not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}

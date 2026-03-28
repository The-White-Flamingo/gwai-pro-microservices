import { ActiveUser, ActiveUserData, Auth, AuthType } from '@app/iam';
import {
  Body,
  Controller,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
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
@ApiTags('clients')
@Auth(AuthType.Bearer)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('profilePicture', profilePictureUploadOptions),
  )
  @ApiOperation({
    summary: 'Create client profile',
    description:
      'Creates the authenticated user client profile and stores the uploaded profile picture on the server.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'firstName',
        'lastName',
        'username',
        'phone',
        'dateOfBirth',
        'address',
        'interests',
        'genres',
      ],
      properties: {
        firstName: { type: 'string', example: 'Kwame' },
        lastName: { type: 'string', example: 'Mensah' },
        username: { type: 'string', example: 'kwame_mensah' },
        phone: { type: 'string', example: '+233201234567' },
        dateOfBirth: {
          type: 'string',
          format: 'date-time',
          example: '1997-08-14T00:00:00.000Z',
        },
        address: { type: 'string', example: 'Tema, Accra' },
        interests: {
          type: 'string',
          example: '["Music Production","Live Performance"]',
        },
        genres: {
          type: 'string',
          example: '["Gospel","Hip Hop"]',
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
    description: 'Client created successfully',
    schema: {
      example: {
        status: true,
        message: 'Client profile created successfully',
        data: {
          id: 'd51ae9b1-70dd-43d7-98e2-72e45d8cb7fe',
          firstName: 'Kwame',
          lastName: 'Mensah',
          username: 'kwame_mensah',
          phone: '+233201234567',
          dateOfBirth: '1997-08-14T00:00:00.000Z',
          address: 'Tema, Accra',
          interests: ['Music Production', 'Live Performance'],
          genres: ['Gospel', 'Hip Hop'],
          profilePicturePath:
            '/uploads/profile-pictures/7e2e5d0b-2da0-40ea-9838-42b8c2d87615.jpg',
          createdAt: '2026-03-28T09:00:00.000Z',
          updatedAt: '2026-03-28T09:00:00.000Z',
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
    description: 'Client profile or user identity conflict',
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
        message: 'Request to users-service timed out for pattern createClient',
        error: 'Gateway Timeout',
        statusCode: 504,
      },
    },
  })
  create(
    @Body() createClientDto: any,
    @UploadedFile() file: Express.Multer.File,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.clientsService.create(
      {
        ...createClientDto,
        interests: normalizeStringArrayField(createClientDto.interests),
        genres: normalizeStringArrayField(createClientDto.genres),
        profilePicturePath: toProfilePicturePath(file),
      },
      activeUser.sub,
    );
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
        username: { type: 'string', example: 'kwame_mensah' },
        phone: { type: 'string', example: '+233201234567' },
        dateOfBirth: {
          type: 'string',
          format: 'date-time',
          example: '1997-08-14T00:00:00.000Z',
        },
        address: { type: 'string', example: 'Tema, Accra' },
        interests: {
          type: 'array',
          items: { type: 'string' },
          example: ['Music Production', 'Songwriting'],
        },
        genres: {
          type: 'array',
          items: { type: 'string' },
          example: ['Gospel', 'Jazz'],
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
          username: 'kwame_mensah',
          phone: '+233201234567',
          dateOfBirth: '1997-08-14T00:00:00.000Z',
          address: 'Tema, Accra',
          interests: ['Music Production', 'Songwriting'],
          genres: ['Gospel', 'Jazz'],
          profilePicturePath:
            '/uploads/profile-pictures/7e2e5d0b-2da0-40ea-9838-42b8c2d87615.jpg',
          createdAt: '2026-03-28T09:00:00.000Z',
          updatedAt: '2026-03-28T09:30:00.000Z',
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
    return this.clientsService.update(
      {
        ...updateClientDto,
        interests:
          normalizeStringArrayField(updateClientDto.interests) ??
          updateClientDto.interests,
        genres:
          normalizeStringArrayField(updateClientDto.genres) ??
          updateClientDto.genres,
      },
      activeUser.sub,
    );
  }
}

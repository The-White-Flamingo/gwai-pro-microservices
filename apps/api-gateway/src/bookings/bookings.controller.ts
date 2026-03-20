import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto } from '@app/bookings';
import { ActiveUser, ActiveUserData, Auth, AuthType } from '@app/iam';

@ApiTags('bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Auth(AuthType.Bearer)
  @Post()
  @ApiOkResponse({
    schema: {
      example: {
        status: true,
        message: 'Booking created successfully',
        data: {
          id: 'uuid',
          userId: 'uuid',
          serviceType: 'Consultation',
          date: '2026-02-21',
          startTime: '10:00:00',
          endTime: '11:00:00',
          status: 'Requested',
          createdAt: '2026-02-21T12:00:00.000Z',
          updateAt: '2026-02-21T12:00:00.000Z',
        },
      },
    },
  })
  create(
    @Body() dto: Omit<CreateBookingDto, 'userId'>,
    @ActiveUser() user: ActiveUserData,
  ) {
    // Inject userId from JWT so the DB doesn’t break
    const payload: CreateBookingDto = { ...dto, userId: user.sub } as CreateBookingDto;
    return this.bookingsService.create(payload);
  }

  @Auth(AuthType.Bearer)
  @Get()
  @ApiOkResponse({
    schema: {
      example: {
        status: true,
        message: 'Bookings retrieved successfully',
        data: [
          {
            id: 'uuid',
            userId: 'uuid',
            serviceType: 'Consultation',
            date: '2026-02-21',
            startTime: '10:00:00',
            endTime: '11:00:00',
            status: 'Requested',
            createdAt: '2026-02-21T12:00:00.000Z',
            updateAt: '2026-02-21T12:00:00.000Z',
          },
        ],
      },
    },
  })
  findAll() {
    return this.bookingsService.findAll();
  }

  @Auth(AuthType.Bearer)
  @Get(':id')
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiOkResponse({
    schema: {
      example: {
        status: true,
        message: 'Booking retrieved successfully',
        data: {
          id: 'uuid',
          userId: 'uuid',
          serviceType: 'Consultation',
          date: '2026-02-21',
          startTime: '10:00:00',
          endTime: '11:00:00',
          status: 'Requested',
          createdAt: '2026-02-21T12:00:00.000Z',
          updateAt: '2026-02-21T12:00:00.000Z',
        },
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Auth(AuthType.Bearer)
  @Patch(':id')
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiOkResponse({
    schema: {
      example: {
        status: true,
        message: 'Booking updated successfully',
        data: {
          id: 'uuid',
          userId: 'uuid',
          serviceType: 'Consultation',
          date: '2026-02-21',
          startTime: '12:00:00',
          endTime: '13:00:00',
          status: 'Requested',
          createdAt: '2026-02-21T12:00:00.000Z',
          updateAt: '2026-02-21T12:10:00.000Z',
        },
      },
    },
  })
  update(@Param('id') id: string, @Body() body: Partial<CreateBookingDto>) {
    // UpdateBookingDto requires id
    const dto: UpdateBookingDto = { id, ...body } as UpdateBookingDto;
    return this.bookingsService.update(dto);
  }

  @Auth(AuthType.Bearer)
  @Delete(':id')
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiOkResponse({
    schema: { example: { status: true, message: 'Booking deleted successfully' } },
  })
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }
}
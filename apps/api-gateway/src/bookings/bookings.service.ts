import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookingDto, UpdateBookingDto } from '@app/bookings';
import { BOOKING_SERVICE } from '@app/shared';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class BookingsService {
  constructor(@Inject(BOOKING_SERVICE) private readonly client: ClientProxy) {}

  async create(createBookingDto: CreateBookingDto) {
    try {
      const booking = await lastValueFrom(
        this.client.send('bookings.create', { ...createBookingDto }),
      );

      return booking;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      const booking = await lastValueFrom(
        this.client.send('bookings.findAll', {}),
      );

      return booking;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      const booking = await lastValueFrom(
        this.client.send('bookings.findOne', { id }),
      );

      return booking;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updateBookingDto: UpdateBookingDto) {
    try {
      const booking = await lastValueFrom(
        this.client.send('bookings.update', {
          id,
          ...updateBookingDto,
        }),
      );

      return booking;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const booking = await lastValueFrom(
        this.client.send('bookings.delete', { id }),
      );

      return booking;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }
}

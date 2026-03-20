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
      return await lastValueFrom(
        this.client.send('bookings.create', createBookingDto),
      );
    } catch (error: any) {
      throw new BadRequestException(error?.message ?? 'Failed to create booking');
    }
  }

  async findAll() {
    try {
      return await lastValueFrom(this.client.send('bookings.findAll', {}));
    } catch (error: any) {
      throw new BadRequestException(error?.message ?? 'Failed to fetch bookings');
    }
  }

  async findOne(id: string) {
    try {
      // IMPORTANT: booking-service expects id string
      return await lastValueFrom(this.client.send('bookings.findOne', id));
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error?.message ?? 'Failed to fetch booking');
    }
  }

  async update(updateBookingDto: UpdateBookingDto) {
    try {
      // IMPORTANT: pattern is bookings.update (plural)
      return await lastValueFrom(this.client.send('bookings.update', updateBookingDto));
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error?.message ?? 'Failed to update booking');
    }
  }

  async remove(id: string) {
    try {
      // IMPORTANT: booking-service expects id string
      return await lastValueFrom(this.client.send('bookings.delete', id));
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error?.message ?? 'Failed to delete booking');
    }
  }
}
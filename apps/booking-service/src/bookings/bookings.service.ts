// apps/booking-service/src/bookings/bookings.service.ts
import { CreateBookingDto, UpdateBookingDto } from '@app/bookings';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) { }

  async create(createBookingDto: CreateBookingDto) {
    try {
      const booking = this.bookingRepository.create(createBookingDto);

      await this.bookingRepository.save(booking);

      return {
        status: true,
        message: 'Booking created successfully',
        data: booking,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      const bookings = await this.bookingRepository.find();

      return {
        status: true,
        message: 'Bookings retrieved successfully',
        data: bookings,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      const booking = await this.bookingRepository.findOneBy({ id });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      return {
        status: true,
        message: 'Booking retrieved successfully',
        data: booking,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  async update(updateBookingDto: UpdateBookingDto) {
    try {
      const booking = await this.bookingRepository.findOneBy({
        id: updateBookingDto.id,
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      await this.bookingRepository.update(updateBookingDto.id, { ...updateBookingDto });

      const updated = await this.bookingRepository.findOneBy({ id: updateBookingDto.id });

      return {
        status: true,
        message: 'Booking updated successfully',
        data: updated,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const booking = await this.bookingRepository.findOneBy({ id });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      await this.bookingRepository.remove(booking);

      return {
        status: true,
        message: 'Booking deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }
}

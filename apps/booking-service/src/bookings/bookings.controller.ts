import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @MessagePattern('createBooking')
  create(@Payload() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @MessagePattern('findAllBookings')
  findAll() {
    return this.bookingsService.findAll();
  }

  @MessagePattern('findOneBooking')
  findOne(@Payload() id: number) {
    return this.bookingsService.findOne(id);
  }

  @MessagePattern('updateBooking')
  update(@Payload() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(updateBookingDto.id, updateBookingDto);
  }

  @MessagePattern('removeBooking')
  remove(@Payload() id: number) {
    return this.bookingsService.remove(id);
  }
}

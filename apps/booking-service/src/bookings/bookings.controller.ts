import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto } from '@app/bookings';

@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @MessagePattern('bookings.create')
  create(@Payload() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @MessagePattern('bookings.findAll')
  findAll() {
    return this.bookingsService.findAll();
  }

  @MessagePattern('bookings.findOne')
  findOne(@Payload() id: string) {
    return this.bookingsService.findOne(id);
  }

  // IMPORTANT: match gateway pattern (plural)
  @MessagePattern('bookings.update')
  update(@Payload() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(updateBookingDto);
  }

  // IMPORTANT: match gateway pattern (plural)
  @MessagePattern('bookings.delete')
  remove(@Payload() id: string) {
    return this.bookingsService.remove(id);
  }
}
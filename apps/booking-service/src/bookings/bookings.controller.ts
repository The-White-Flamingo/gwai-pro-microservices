// apps/booking-service/src/bookings/bookings.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BookingsService } from './bookings.service';
import { BookingStatus, CreateBookingDto, UpdateBookingDto } from '@app/bookings';

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

  // ═══════════════════════════════════════════════════════════════════════════
    // CHAT INTEGRATION
    // ═══════════════════════════════════════════════════════════════════════════
  
    /**
     * Called by chat-service to verify a booking exists and is accepted
     * before allowing a client to start a chat.
     *
     * Flow:
     * 1. Client books musician/studio → status: Requested
     * 2. Musician/studio accepts → status: Request_Accepted
     * 3. Client tries to start chat → chat-service calls THIS to verify
     * 4. If booking is accepted, chat is created
     *
     * @param payload.bookingId - The booking ID
     * @param payload.clientId - The client's User ID
     * @param payload.providerId - The musician.id or studio.id
     * @returns { isAccepted: boolean, booking?, reason? }
     */
    @MessagePattern('verify_booking_for_chat')
    async verifyBookingForChat(
      @Payload()
      payload: {
        bookingId: string;
        clientId: string;
        providerId: string; // musician.id or studio.id
      },
    ) {
      try {
        // Get the booking
        const result = await this.bookingsService.findOne(payload.bookingId);
  
        // Booking not found
        if (!result || !result.status || !result.data) {
          return {
            isAccepted: false,
            reason: 'Booking not found',
          };
        }
  
        const booking = result.data;
  
        // Verify the booking belongs to this client
        if (booking.userId !== payload.clientId) {
          return {
            isAccepted: false,
            reason: 'This booking does not belong to you',
          };
        }
  
        // Verify the booking is for this provider (musician or studio)
        if (booking.providerId !== payload.providerId) {
          return {
            isAccepted: false,
            reason: 'This booking is not for the selected musician/studio',
          };
        }
  
        // Check if booking status allows chat
        // Chat is available from Request_Accepted onwards
        const chatAllowedStatuses = [
          BookingStatus.Request_Accepted,
          BookingStatus.Booked,
          BookingStatus.In_Session,
          BookingStatus.Session_Closed,
        ];
  
        const isAccepted = chatAllowedStatuses.includes(booking.status);
  
        if (!isAccepted) {
          return {
            isAccepted: false,
            reason: `Chat is only available after booking is accepted. Current status: ${booking.status}`,
          };
        }
  
        // All checks passed! Chat can be created
        return {
          isAccepted: true,
          booking,
        };
      } catch (error) {
        return {
          isAccepted: false,
          reason: `Error verifying booking: ${error.message}`,
        };
      }
    }
}

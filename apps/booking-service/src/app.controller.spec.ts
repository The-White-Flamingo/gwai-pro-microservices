import { Test, TestingModule } from '@nestjs/testing';
import { BookingServiceController } from './app.controller';
import { BookingServiceService } from './app.service';

describe('BookingServiceController', () => {
  let bookingServiceController: BookingServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BookingServiceController],
      providers: [BookingServiceService],
    }).compile();

    bookingServiceController = app.get<BookingServiceController>(
      BookingServiceController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(bookingServiceController.getHello()).toBe('Hello World!');
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { WaitlistServiceController } from './app.controller';
import { WaitlistServiceService } from './app.service';

describe('WaitlistServiceController', () => {
  let waitlistServiceController: WaitlistServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [WaitlistServiceController],
      providers: [WaitlistServiceService],
    }).compile();

    waitlistServiceController = app.get<WaitlistServiceController>(WaitlistServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(waitlistServiceController.getHello()).toBe('Hello World!');
    });
  });
});

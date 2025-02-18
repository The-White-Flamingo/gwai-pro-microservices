import { Test, TestingModule } from '@nestjs/testing';
import { MailingServiceController } from './mailing-service.controller';
import { MailingServiceService } from './mailing-service.service';

describe('MailingServiceController', () => {
  let mailingServiceController: MailingServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MailingServiceController],
      providers: [MailingServiceService],
    }).compile();

    mailingServiceController = app.get<MailingServiceController>(MailingServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(mailingServiceController.getHello()).toBe('Hello World!');
    });
  });
});

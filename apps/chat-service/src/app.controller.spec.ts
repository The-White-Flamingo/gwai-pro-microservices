import { Test, TestingModule } from '@nestjs/testing';
import { ChatServiceController } from './app.controller';
import { ChatServiceService } from './app.service';

describe('ChatServiceController', () => {
  let chatServiceController: ChatServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ChatServiceController],
      providers: [ChatServiceService],
    }).compile();

    chatServiceController = app.get<ChatServiceController>(
      ChatServiceController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(chatServiceController.getHello()).toBe('Hello World!');
    });
  });
});

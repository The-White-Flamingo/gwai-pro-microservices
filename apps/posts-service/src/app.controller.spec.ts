import { Test, TestingModule } from '@nestjs/testing';
import { PostsServiceController } from './app.controller';
import { PostsServiceService } from './app.service';

describe('PostsServiceController', () => {
  let postsServiceController: PostsServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PostsServiceController],
      providers: [PostsServiceService],
    }).compile();

    postsServiceController = app.get<PostsServiceController>(PostsServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(postsServiceController.getHello()).toBe('Hello World!');
    });
  });
});

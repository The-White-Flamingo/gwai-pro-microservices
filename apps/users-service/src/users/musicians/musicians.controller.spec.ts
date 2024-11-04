import { Test, TestingModule } from '@nestjs/testing';
import { MusiciansController } from './musicians.controller';
import { MusiciansService } from './musicians.service';

describe('MusiciansController', () => {
  let controller: MusiciansController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MusiciansController],
      providers: [MusiciansService],
    }).compile();

    controller = module.get<MusiciansController>(MusiciansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

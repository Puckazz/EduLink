import { Test, TestingModule } from '@nestjs/testing';
import { MajorController } from './major.controller';
import { MajorService } from './major.service';

describe('MajorController', () => {
  let controller: MajorController;
  const majorServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MajorController],
      providers: [
        {
          provide: MajorService,
          useValue: majorServiceMock,
        },
      ],
    }).compile();

    controller = module.get<MajorController>(MajorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

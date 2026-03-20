import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { GeneratedScheduleService } from '../module/generated-schedule/generated-schedule.service';
import { GaService } from './ga.service';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaServiceMock {},
}));

describe('GaService', () => {
  let service: GaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GaService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: GeneratedScheduleService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<GaService>(GaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

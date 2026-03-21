import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateScheduleConfigDto } from './dto/create-schedule-config.dto';
import { UpdateScheduleConfigDto } from './dto/update-schedule-config.dto';

@Injectable()
export class ScheduleConfigService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    createScheduleConfigDto: CreateScheduleConfigDto,
    userId: number,
  ) {
    return this.prismaService.scheduleConfig.create({
      data: {
        periodDurationM: createScheduleConfigDto.periodDurationM,
        morningStartTime: createScheduleConfigDto.morningStartTime,
        morningEndTime: createScheduleConfigDto.morningEndTime,
        afternoonStartTime: createScheduleConfigDto.afternoonStartTime,
        afternoonEndTime: createScheduleConfigDto.afternoonEndTime,
        maxGeneration: createScheduleConfigDto.maxGeneration,
        startPopulationSize: createScheduleConfigDto.startPopulationSize,
        selectionMethod: createScheduleConfigDto.selectionMethod,
        crossMethod: createScheduleConfigDto.crossMethod,
        mutationMethod: createScheduleConfigDto.mutationMethod,
        createdBy: String(userId),
      },
    });
  }

  async findAll() {
    return this.prismaService.scheduleConfig.findMany({
      where: { active: true },
      orderBy: { scheduleConfigId: 'asc' },
    });
  }

  async findOne(scheduleConfigId: number) {
    const scheduleConfig = await this.prismaService.scheduleConfig.findUnique({
      where: { scheduleConfigId: BigInt(scheduleConfigId) },
    });

    if (!scheduleConfig || !scheduleConfig.active) {
      throw new NotFoundException(
        `ScheduleConfig with id ${scheduleConfigId} not found`,
      );
    }

    return scheduleConfig;
  }

  async update(
    scheduleConfigId: number,
    updateScheduleConfigDto: UpdateScheduleConfigDto,
    userId: number,
  ) {
    await this.findOne(scheduleConfigId);

    return this.prismaService.scheduleConfig.update({
      where: { scheduleConfigId: BigInt(scheduleConfigId) },
      data: {
        periodDurationM: updateScheduleConfigDto.periodDurationM,
        morningStartTime: updateScheduleConfigDto.morningStartTime,
        morningEndTime: updateScheduleConfigDto.morningEndTime,
        afternoonStartTime: updateScheduleConfigDto.afternoonStartTime,
        afternoonEndTime: updateScheduleConfigDto.afternoonEndTime,
        maxGeneration: updateScheduleConfigDto.maxGeneration,
        startPopulationSize: updateScheduleConfigDto.startPopulationSize,
        selectionMethod: updateScheduleConfigDto.selectionMethod,
        crossMethod: updateScheduleConfigDto.crossMethod,
        mutationMethod: updateScheduleConfigDto.mutationMethod,
        active: updateScheduleConfigDto.active,
        updatedBy: String(userId),
      },
    });
  }

  async remove(scheduleConfigId: number, userId: number) {
    await this.findOne(scheduleConfigId);

    return this.prismaService.scheduleConfig.update({
      where: { scheduleConfigId: BigInt(scheduleConfigId) },
      data: {
        active: false,
        updatedBy: String(userId),
      },
    });
  }
}

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConfigClassroomDto } from './dto/create-config-classroom.dto';
import { UpdateConfigClassroomDto } from './dto/update-config-classroom.dto';

@Injectable()
export class ConfigClassroomService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createDto: CreateConfigClassroomDto, userId: number) {
    await this.ensureDependencies(
      createDto.classroomId,
      createDto.scheduleConfigId,
    );

    return this.prismaService.configClassroom.create({
      data: {
        classroomId: createDto.classroomId,
        scheduleConfigId: BigInt(createDto.scheduleConfigId),
        typeOfSchedule: createDto.typeOfSchedule,
        classroomType: createDto.classroomType,
        createdBy: String(userId),
      },
    });
  }

  async findAll() {
    return this.prismaService.configClassroom.findMany({
      where: { active: true },
      include: {
        classroom: true,
      },
      orderBy: { configClassroomId: 'asc' },
    });
  }

  async findOne(configClassroomId: number) {
    const entity = await this.prismaService.configClassroom.findUnique({
      where: { configClassroomId: BigInt(configClassroomId) },
    });

    if (!entity || !entity.active) {
      throw new NotFoundException(
        `ConfigClassroom with id ${configClassroomId} not found`,
      );
    }

    return entity;
  }

  async update(
    configClassroomId: number,
    updateDto: UpdateConfigClassroomDto,
    userId: number,
  ) {
    await this.findOne(configClassroomId);

    if (updateDto.classroomId || updateDto.scheduleConfigId) {
      await this.ensureDependencies(
        updateDto.classroomId,
        updateDto.scheduleConfigId,
      );
    }

    return this.prismaService.configClassroom.update({
      where: { configClassroomId: BigInt(configClassroomId) },
      data: {
        classroomId: updateDto.classroomId,
        scheduleConfigId: updateDto.scheduleConfigId
          ? BigInt(updateDto.scheduleConfigId)
          : undefined,
        typeOfSchedule: updateDto.typeOfSchedule,
        classroomType: updateDto.classroomType,
        active: updateDto.active,
        updatedBy: String(userId),
      },
    });
  }

  async remove(configClassroomId: number, userId: number) {
    await this.findOne(configClassroomId);

    return this.prismaService.configClassroom.update({
      where: { configClassroomId: BigInt(configClassroomId) },
      data: {
        active: false,
        updatedBy: String(userId),
      },
    });
  }

  private async ensureDependencies(
    classroomId?: number,
    scheduleConfigId?: number,
  ) {
    if (classroomId) {
      const classroom = await this.prismaService.classroom.findUnique({
        where: { classroomId },
      });
      if (!classroom || !classroom.active) {
        throw new NotFoundException(
          `Classroom with id ${classroomId} not found`,
        );
      }
    }

    if (scheduleConfigId) {
      const scheduleConfig = await this.prismaService.scheduleConfig.findUnique(
        {
          where: { scheduleConfigId: BigInt(scheduleConfigId) },
        },
      );
      if (!scheduleConfig || !scheduleConfig.active) {
        throw new NotFoundException(
          `ScheduleConfig with id ${scheduleConfigId} not found`,
        );
      }
    }

    if (classroomId && scheduleConfigId) {
      const classroomConfig =
        await this.prismaService.configClassroom.findFirst({
          where: {
            classroomId,
            scheduleConfigId: BigInt(scheduleConfigId),
            active: true,
          },
        });

      if (classroomConfig) {
        throw new ConflictException('Esta clase ya existe en la configuración');
      }
    }
  }
}

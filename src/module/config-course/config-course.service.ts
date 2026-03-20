import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConfigCourseDto } from './dto/create-config-course.dto';
import { UpdateConfigCourseDto } from './dto/update-config-course.dto';

@Injectable()
export class ConfigCourseService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createDto: CreateConfigCourseDto, userId: number) {
    this.validateFixedConfig(createDto);

    await this.ensureDependencies(
      createDto.scheduleConfigId,
      createDto.courseCode,
    );

    return this.prismaService.configCourse.create({
      data: {
        configCourseId: BigInt(createDto.configCourseId),
        scheduleConfigId: BigInt(createDto.scheduleConfigId),
        courseCode: createDto.courseCode,
        sectionQty: createDto.sectionQty,
        scheduleTime: createDto.scheduleTime,
        requireClassroom: createDto.requireClassroom,
        typeOfSchedule: createDto.typeOfSchedule,
        isFixed: createDto.isFixed ?? false,
        fixedDayIndex: createDto.isFixed ? createDto.fixedDayIndex : undefined,
        fixedStartSlot: createDto.isFixed
          ? createDto.fixedStartSlot
          : undefined,
        configClassroomId: createDto.configClassroomId
          ? BigInt(createDto.configClassroomId)
          : undefined,
        createdBy: String(userId),
      },
    });
  }

  async findAll() {
    return this.prismaService.configCourse.findMany({
      where: { active: true },
      orderBy: { configCourseId: 'asc' },
    });
  }

  async findOne(configCourseId: number) {
    const entity = await this.prismaService.configCourse.findUnique({
      where: { configCourseId: BigInt(configCourseId) },
    });

    if (!entity || !entity.active) {
      throw new NotFoundException(
        `ConfigCourse with id ${configCourseId} not found`,
      );
    }

    return entity;
  }

  async update(
    configCourseId: number,
    updateDto: UpdateConfigCourseDto,
    userId: number,
  ) {
    const existing = await this.findOne(configCourseId);
    this.validateFixedConfig({
      ...existing,
      ...updateDto,
    });

    if (updateDto.scheduleConfigId || updateDto.courseCode) {
      await this.ensureDependencies(
        updateDto.scheduleConfigId,
        updateDto.courseCode,
      );
    }

    return this.prismaService.configCourse.update({
      where: { configCourseId: BigInt(configCourseId) },
      data: {
        configCourseId: updateDto.configCourseId
          ? BigInt(updateDto.configCourseId)
          : undefined,
        scheduleConfigId: updateDto.scheduleConfigId
          ? BigInt(updateDto.scheduleConfigId)
          : undefined,
        courseCode: updateDto.courseCode,
        sectionQty: updateDto.sectionQty,
        scheduleTime: updateDto.scheduleTime,
        requireClassroom: updateDto.requireClassroom,
        typeOfSchedule: updateDto.typeOfSchedule,
        isFixed: updateDto.isFixed,
        fixedDayIndex:
          updateDto.isFixed === false ? null : updateDto.fixedDayIndex,
        fixedStartSlot:
          updateDto.isFixed === false ? null : updateDto.fixedStartSlot,
        configClassroomId: updateDto.configClassroomId
          ? BigInt(updateDto.configClassroomId)
          : undefined,
        updatedBy: String(userId),
      },
    });
  }

  async remove(configCourseId: number, userId: number) {
    await this.findOne(configCourseId);

    return this.prismaService.configCourse.update({
      where: { configCourseId: BigInt(configCourseId) },
      data: {
        active: false,
        updatedBy: String(userId),
      },
    });
  }

  private async ensureDependencies(
    scheduleConfigId?: number,
    courseCode?: number,
  ) {
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

    if (courseCode) {
      const course = await this.prismaService.course.findUnique({
        where: { courseCode },
      });
      if (!course || !course.active) {
        throw new NotFoundException(`Course with code ${courseCode} not found`);
      }
    }
  }

  private validateFixedConfig(data: {
    isFixed?: boolean;
    fixedDayIndex?: number | null;
    fixedStartSlot?: number | null;
  }) {
    if (!data.isFixed) {
      return;
    }

    if (
      data.fixedDayIndex === undefined ||
      data.fixedDayIndex === null ||
      data.fixedStartSlot === undefined ||
      data.fixedStartSlot === null
    ) {
      throw new BadRequestException(
        'Fixed config courses must define fixedDayIndex and fixedStartSlot',
      );
    }

    if (![0, 1, 2].includes(data.fixedDayIndex)) {
      throw new BadRequestException(
        'fixedDayIndex must be one of 0 (CLASS), 1 (LAB1), 2 (LAB2)',
      );
    }
  }
}

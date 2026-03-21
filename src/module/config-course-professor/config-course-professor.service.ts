import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConfigCourseProfessorDto } from './dto/create-config-course-professor.dto';
import { UpdateConfigCourseProfessorDto } from './dto/update-config-course-professor.dto';

@Injectable()
export class ConfigCourseProfessorService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createDto: CreateConfigCourseProfessorDto, userId: number) {
    await this.ensureDependencies(
      createDto.configProfessorId,
      createDto.configCourseId,
    );

    return this.prismaService.configCourseProfessor.create({
      data: {
        configProfessorId: BigInt(createDto.configProfessorId),
        configCourseId: BigInt(createDto.configCourseId),
        createdBy: String(userId),
      },
    });
  }

  async findAll() {
    return this.prismaService.configCourseProfessor.findMany({
      where: { active: true },
      include: {
        configProfessor: { include: { professor: true } },
        configCourse: { include: { course: true } },
      },
      orderBy: { configCourseProfessorId: 'asc' },
    });
  }

  async findOne(configCourseProfessorId: number) {
    const entity = await this.prismaService.configCourseProfessor.findUnique({
      where: { configCourseProfessorId: BigInt(configCourseProfessorId) },
    });

    if (!entity || !entity.active) {
      throw new NotFoundException(
        `ConfigCourseProfessor with id ${configCourseProfessorId} not found`,
      );
    }

    return entity;
  }

  async update(
    configCourseProfessorId: number,
    updateDto: UpdateConfigCourseProfessorDto,
    userId: number,
  ) {
    await this.findOne(configCourseProfessorId);

    if (updateDto.configProfessorId || updateDto.configCourseId) {
      await this.ensureDependencies(
        updateDto.configProfessorId,
        updateDto.configCourseId,
      );
    }

    return this.prismaService.configCourseProfessor.update({
      where: { configCourseProfessorId: BigInt(configCourseProfessorId) },
      data: {
        configProfessorId: updateDto.configProfessorId
          ? BigInt(updateDto.configProfessorId)
          : undefined,
        configCourseId: updateDto.configCourseId
          ? BigInt(updateDto.configCourseId)
          : undefined,
        updatedBy: String(userId),
      },
    });
  }

  async remove(configCourseProfessorId: number) {
    await this.findOne(configCourseProfessorId);

    return this.prismaService.configCourseProfessor.delete({
      where: { configCourseProfessorId: BigInt(configCourseProfessorId) },
    });
  }

  private async ensureDependencies(
    configProfessorId?: number,
    configCourseId?: number,
  ) {
    if (configProfessorId) {
      const configProfessor =
        await this.prismaService.configProfessor.findUnique({
          where: { configProfessorId: BigInt(configProfessorId) },
        });
      if (!configProfessor || !configProfessor.active) {
        throw new NotFoundException(
          `ConfigProfessor with id ${configProfessorId} not found`,
        );
      }
    }

    if (configCourseId) {
      const configCourse = await this.prismaService.configCourse.findUnique({
        where: { configCourseId: BigInt(configCourseId) },
      });
      if (!configCourse || !configCourse.active) {
        throw new NotFoundException(
          `ConfigCourse with id ${configCourseId} not found`,
        );
      }
    }

    if (configCourseId && configProfessorId) {
      const configCourseProfessor =
        await this.prismaService.configCourseProfessor.findFirst({
          where: {
            configProfessorId: BigInt(configProfessorId),
            configCourseId: BigInt(configCourseId),
          },
        });

      if (configCourseProfessor) {
        throw new ConflictException(
          'Este profesor y curso ya están configurados',
        );
      }
    }
  }
}

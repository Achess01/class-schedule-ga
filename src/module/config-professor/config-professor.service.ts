import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConfigProfessorDto } from './dto/create-config-professor.dto';
import { UpdateConfigProfessorDto } from './dto/update-config-professor.dto';

@Injectable()
export class ConfigProfessorService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createDto: CreateConfigProfessorDto, userId: number) {
    await this.ensureDependencies(createDto.professorCode, createDto.scheduleConfigId);

    return this.prismaService.configProfessor.create({
      data: {
        ...createDto,
        configProfessorId: BigInt(createDto.configProfessorId),
        scheduleConfigId: BigInt(createDto.scheduleConfigId),
        createdBy: String(userId),
      },
    });
  }

  async findAll() {
    return this.prismaService.configProfessor.findMany({
      where: { active: true },
      orderBy: { configProfessorId: 'asc' },
    });
  }

  async findOne(configProfessorId: number) {
    const entity = await this.prismaService.configProfessor.findUnique({
      where: { configProfessorId: BigInt(configProfessorId) },
    });

    if (!entity || !entity.active) {
      throw new NotFoundException(
        `ConfigProfessor with id ${configProfessorId} not found`,
      );
    }

    return entity;
  }

  async update(configProfessorId: number, updateDto: UpdateConfigProfessorDto, userId: number) {
    await this.findOne(configProfessorId);

    if (updateDto.professorCode || updateDto.scheduleConfigId) {
      await this.ensureDependencies(updateDto.professorCode, updateDto.scheduleConfigId);
    }

    return this.prismaService.configProfessor.update({
      where: { configProfessorId: BigInt(configProfessorId) },
      data: {
        ...updateDto,
        configProfessorId: updateDto.configProfessorId
          ? BigInt(updateDto.configProfessorId)
          : undefined,
        scheduleConfigId: updateDto.scheduleConfigId
          ? BigInt(updateDto.scheduleConfigId)
          : undefined,
        updatedBy: String(userId),
      },
    });
  }

  async remove(configProfessorId: number, userId: number) {
    await this.findOne(configProfessorId);

    return this.prismaService.configProfessor.update({
      where: { configProfessorId: BigInt(configProfessorId) },
      data: {
        active: false,
        updatedBy: String(userId),
      },
    });
  }

  private async ensureDependencies(professorCode?: number, scheduleConfigId?: number) {
    if (professorCode) {
      const professor = await this.prismaService.professor.findUnique({
        where: { professorCode },
      });
      if (!professor || !professor.active) {
        throw new NotFoundException(`Professor with code ${professorCode} not found`);
      }
    }

    if (scheduleConfigId) {
      const scheduleConfig = await this.prismaService.scheduleConfig.findUnique({
        where: { scheduleConfigId: BigInt(scheduleConfigId) },
      });
      if (!scheduleConfig || !scheduleConfig.active) {
        throw new NotFoundException(
          `ScheduleConfig with id ${scheduleConfigId} not found`,
        );
      }
    }
  }
}

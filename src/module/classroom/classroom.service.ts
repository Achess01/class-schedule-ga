import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';

@Injectable()
export class ClassroomService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createClassroomDto: CreateClassroomDto, userId: number) {
    return this.prismaService.classroom.create({
      data: {
        ...createClassroomDto,
        createdBy: String(userId),
      },
    });
  }

  async findAll() {
    return this.prismaService.classroom.findMany({
      where: { active: true },
      orderBy: { classroomId: 'asc' },
    });
  }

  async findOne(classroomId: number) {
    const classroom = await this.prismaService.classroom.findUnique({
      where: { classroomId },
    });

    if (!classroom || !classroom.active) {
      throw new NotFoundException(`Classroom with id ${classroomId} not found`);
    }

    return classroom;
  }

  async update(
    classroomId: number,
    updateClassroomDto: UpdateClassroomDto,
    userId: number,
  ) {
    await this.findOne(classroomId);

    return this.prismaService.classroom.update({
      where: { classroomId },
      data: {
        ...updateClassroomDto,
        updatedBy: String(userId),
      },
    });
  }

  async remove(classroomId: number, userId: number) {
    await this.findOne(classroomId);

    return this.prismaService.classroom.update({
      where: { classroomId },
      data: {
        active: false,
        updatedBy: String(userId),
      },
    });
  }
}

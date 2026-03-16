import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourseCareerDto } from './dto/create-course-career.dto';
import { UpdateCourseCareerDto } from './dto/update-course-career.dto';

@Injectable()
export class CourseCareerService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createDto: CreateCourseCareerDto, userId: number) {
    await this.ensureDependencies(createDto.courseCode, createDto.careerCode);

    return this.prismaService.courseCareer.create({
      data: {
        ...createDto,
        createdBy: String(userId),
      },
    });
  }

  async findAll() {
    return this.prismaService.courseCareer.findMany({
      where: { active: true },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const entity = await this.prismaService.courseCareer.findUnique({
      where: { id },
    });

    if (!entity || !entity.active) {
      throw new NotFoundException(`CourseCareer with id ${id} not found`);
    }

    return entity;
  }

  async update(id: number, updateDto: UpdateCourseCareerDto, userId: number) {
    await this.findOne(id);

    if (updateDto.courseCode || updateDto.careerCode) {
      await this.ensureDependencies(updateDto.courseCode, updateDto.careerCode);
    }

    return this.prismaService.courseCareer.update({
      where: { id },
      data: {
        ...updateDto,
        updatedBy: String(userId),
      },
    });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id);

    return this.prismaService.courseCareer.update({
      where: { id },
      data: {
        active: false,
        updatedBy: String(userId),
      },
    });
  }

  private async ensureDependencies(courseCode?: number, careerCode?: number) {
    if (courseCode) {
      const course = await this.prismaService.course.findUnique({
        where: { courseCode },
      });
      if (!course || !course.active) {
        throw new NotFoundException(`Course with code ${courseCode} not found`);
      }
    }

    if (careerCode) {
      const career = await this.prismaService.career.findUnique({
        where: { careerCode },
      });
      if (!career || !career.active) {
        throw new NotFoundException(`Career with code ${careerCode} not found`);
      }
    }
  }
}

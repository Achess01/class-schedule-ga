import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CourseService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createCourseDto: CreateCourseDto, userId: number) {
    return this.prismaService.course.create({
      data: {
        ...createCourseDto,
        createdBy: String(userId),
      },
    });
  }

  async findAll() {
    return this.prismaService.course.findMany({
      where: { active: true },
      orderBy: { courseCode: 'asc' },
    });
  }

  async findOne(courseCode: number) {
    const course = await this.prismaService.course.findUnique({
      where: { courseCode },
    });

    if (!course || !course.active) {
      throw new NotFoundException(`Course with code ${courseCode} not found`);
    }

    return course;
  }

  async update(courseCode: number, updateCourseDto: UpdateCourseDto, userId: number) {
    await this.findOne(courseCode);

    return this.prismaService.course.update({
      where: { courseCode },
      data: {
        ...updateCourseDto,
        updatedBy: String(userId),
      },
    });
  }

  async remove(courseCode: number, userId: number) {
    await this.findOne(courseCode);

    return this.prismaService.course.update({
      where: { courseCode },
      data: {
        active: false,
        updatedBy: String(userId),
      },
    });
  }
}

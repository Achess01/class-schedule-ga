import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CourseService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createCourseDto: CreateCourseDto, userId: number) {
    const courseExiste = await this.prismaService.course.findUnique({
      where: { courseCode: createCourseDto.courseCode },
    });
    if (courseExiste && courseExiste.active === false) {
      const updated = await this.prismaService.course.update({
        where: { courseCode: createCourseDto.courseCode },
        data: {
          ...createCourseDto,
          active: true,
          updatedBy: String(userId),
        },
      });
      return {
        data: updated,
        message: 'Course reactivated successfully',
      };
    }
    if (courseExiste) {
      throw new BadRequestException({
        message: 'Course already exists',
        code: 'COURSE_EXISTS',
      });
    }
    const course = await this.prismaService.course.create({
      data: {
        isCommonArea: false,
        ...createCourseDto,
        createdBy: String(userId),
      },
    });

    return {
      data: course,
      message: 'Course created successfully',
    };
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

  async update(
    courseCode: number,
    updateCourseDto: UpdateCourseDto,
    userId: number,
  ) {
    const currentCourse = await this.findOne(courseCode);
    this.validateCourseCodeImmutable(courseCode, updateCourseDto);
    this.validateCommonAreaRules({
      ...currentCourse,
      ...updateCourseDto,
    });

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

  private validateCommonAreaRules(data: {
    isCommonArea?: boolean;
    semester?: number | null;
  }) {
    if (
      data.isCommonArea &&
      (data.semester === null || data.semester === undefined)
    ) {
      throw new BadRequestException(
        'Common area courses must include a semester',
      );
    }
  }

  private async validateUniqueCourseCode(courseCode: number) {
    const existingCourse = await this.prismaService.course.findUnique({
      where: { courseCode },
    });

    if (existingCourse) {
      throw new BadRequestException(`Course code ${courseCode} already exists`);
    }
  }

  private validateCourseCodeImmutable(
    courseCode: number,
    updateCourseDto: UpdateCourseDto,
  ) {
    if (
      updateCourseDto.courseCode !== undefined &&
      updateCourseDto.courseCode !== courseCode
    ) {
      throw new BadRequestException('Course code cannot be modified');
    }
  }
}

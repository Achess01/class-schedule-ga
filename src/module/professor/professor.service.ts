import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { UpdateProfessorDto } from './dto/update-professor.dto';

@Injectable()
export class ProfessorService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createProfessorDto: CreateProfessorDto, userId: number) {
    const existProfessor = await this.prismaService.professor.findUnique({
      where: { professorCode: createProfessorDto.professorCode },
    });
    if (existProfessor && existProfessor.active === false) {
      const updated = await this.prismaService.professor.update({
        where: { professorCode: createProfessorDto.professorCode },
        data: {
          ...createProfessorDto,
          active: true,
          updatedBy: String(userId),
        },
      });
      return {
        data: updated,
        message: 'Professor reactivated successfully',
      };
    }

    if (existProfessor) {
      throw new BadRequestException({
        message: 'Professor already exists',
        code: 'PROFESSOR_EXISTS',
      });
    }
    const professor = await this.prismaService.professor.create({
      data: {
        ...createProfessorDto,
        createdBy: String(userId),
      },
    });
    return {
      data: professor,
      message: 'Professor created successfully',
    };
  }

  async findAll() {
    return this.prismaService.professor.findMany({
      where: { active: true },
      orderBy: { professorCode: 'asc' },
    });
  }

  async findOne(professorCode: number) {
    const professor = await this.prismaService.professor.findUnique({
      where: { professorCode },
    });

    if (!professor || !professor.active) {
      throw new NotFoundException(
        `Professor with code ${professorCode} not found`,
      );
    }

    return professor;
  }

  async update(
    professorCode: number,
    updateProfessorDto: UpdateProfessorDto,
    userId: number,
  ) {
    await this.findOne(professorCode);

    return this.prismaService.professor.update({
      where: { professorCode },
      data: {
        ...updateProfessorDto,
        updatedBy: String(userId),
      },
    });
  }

  async remove(professorCode: number, userId: number) {
    await this.findOne(professorCode);

    return this.prismaService.professor.update({
      where: { professorCode },
      data: {
        active: false,
        updatedBy: String(userId),
      },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { UpdateProfessorDto } from './dto/update-professor.dto';

@Injectable()
export class ProfessorService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createProfessorDto: CreateProfessorDto, userId: number) {
    return this.prismaService.professor.create({
      data: {
        ...createProfessorDto,
        createdBy: String(userId),
      },
    });
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

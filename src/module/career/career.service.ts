import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCareerDto } from './dto/create-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';

@Injectable()
export class CareerService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createCareerDto: CreateCareerDto, userId: number) {
    return this.prismaService.career.create({
      data: {
        ...createCareerDto,
        createdBy: String(userId),
      },
    });
  }

  async findAll() {
    return this.prismaService.career.findMany({
      orderBy: { careerCode: 'asc' },
      where: { active: true },
    });
  }

  async findOne(careerCode: number) {
    const career = await this.prismaService.career.findUnique({
      where: { careerCode, active: true },
    });

    if (!career) {
      throw new NotFoundException(`Career with code ${careerCode} not found`);
    }

    return career;
  }

  async update(
    careerCode: number,
    updateCareerDto: UpdateCareerDto,
    userId: number,
  ) {
    await this.findOne(careerCode);

    return this.prismaService.career.update({
      where: { careerCode, active: true },
      data: {
        ...updateCareerDto,
        updatedBy: String(userId),
      },
    });
  }

  async remove(careerCode: number, userId: number) {
    await this.findOne(careerCode);

    return this.prismaService.career.update({
      where: { careerCode, active: true },
      data: {
        active: false,
        updatedBy: String(userId),
      },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTimeSlotDto } from './dto/create-time-slot.dto';
import { UpdateTimeSlotDto } from './dto/update-time-slot.dto';

@Injectable()
export class TimeSlotService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createTimeSlotDto: CreateTimeSlotDto, userId: number) {
    return this.prismaService.timeSlot.create({
      data: {
        ...createTimeSlotDto,
        timeSlotId: BigInt(createTimeSlotDto.timeSlotId),
        createdBy: String(userId),
      },
    });
  }

  async findAll() {
    return this.prismaService.timeSlot.findMany({
      where: { active: true },
      orderBy: { timeSlotId: 'asc' },
    });
  }

  async findOne(timeSlotId: number) {
    const timeSlot = await this.prismaService.timeSlot.findUnique({
      where: { timeSlotId: BigInt(timeSlotId) },
    });

    if (!timeSlot || !timeSlot.active) {
      throw new NotFoundException(`TimeSlot with id ${timeSlotId} not found`);
    }

    return timeSlot;
  }

  async update(timeSlotId: number, updateTimeSlotDto: UpdateTimeSlotDto, userId: number) {
    await this.findOne(timeSlotId);

    return this.prismaService.timeSlot.update({
      where: { timeSlotId: BigInt(timeSlotId) },
      data: {
        ...updateTimeSlotDto,
        updatedBy: String(userId),
      },
    });
  }

  async remove(timeSlotId: number, userId: number) {
    await this.findOne(timeSlotId);

    return this.prismaService.timeSlot.update({
      where: { timeSlotId: BigInt(timeSlotId) },
      data: {
        active: false,
        updatedBy: String(userId),
      },
    });
  }
}

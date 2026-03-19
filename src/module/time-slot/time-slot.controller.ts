import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import type { JwtPayload } from '../../auth/auth.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateTimeSlotDto } from './dto/create-time-slot.dto';
import { UpdateTimeSlotDto } from './dto/update-time-slot.dto';
import { TimeSlotService } from './time-slot.service';

@ApiTags('time-slots')
@Controller('time-slots')
export class TimeSlotController {
  constructor(private readonly timeSlotService: TimeSlotService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a time slot' })
  @ApiCreatedResponse({
    description: 'Time slot created successfully',
    schema: {
      example: {
        timeSlotId: 1,
        startTime: '2026-03-15T07:00:00.000Z',
        endTime: '2026-03-15T07:50:00.000Z',
        createdBy: '12',
        active: true,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Post()
  async create(
    @Body() createTimeSlotDto: CreateTimeSlotDto,
    @Req() req: Request,
  ) {
    const payload = req['user'] as JwtPayload;
    return this.timeSlotService.create(createTimeSlotDto, payload.sub);
  }

  @ApiOperation({ summary: 'Get all time slots' })
  @ApiOkResponse({
    description: 'Time slots fetched successfully',
    schema: {
      example: [
        {
          timeSlotId: 1,
          startTime: '2026-03-15T07:00:00.000Z',
          endTime: '2026-03-15T07:50:00.000Z',
          active: true,
        },
      ],
    },
  })
  @Get()
  async findAll() {
    return this.timeSlotService.findAll();
  }

  @ApiOperation({ summary: 'Get one time slot by id' })
  @ApiOkResponse({
    description: 'Time slot fetched successfully',
    schema: {
      example: {
        timeSlotId: 1,
        startTime: '2026-03-15T07:00:00.000Z',
        endTime: '2026-03-15T07:50:00.000Z',
        active: true,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Time slot not found' })
  @Get(':timeSlotId')
  async findOne(@Param('timeSlotId', ParseIntPipe) timeSlotId: number) {
    return this.timeSlotService.findOne(timeSlotId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a time slot by id' })
  @ApiOkResponse({
    description: 'Time slot updated successfully',
    schema: {
      example: {
        timeSlotId: 1,
        startTime: '2026-03-15T08:00:00.000Z',
        endTime: '2026-03-15T08:50:00.000Z',
        updatedBy: '12',
        active: true,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Time slot not found' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Patch(':timeSlotId')
  async update(
    @Param('timeSlotId', ParseIntPipe) timeSlotId: number,
    @Body() updateTimeSlotDto: UpdateTimeSlotDto,
    @Req() req: Request,
  ) {
    const payload = req['user'] as JwtPayload;
    return this.timeSlotService.update(
      timeSlotId,
      updateTimeSlotDto,
      payload.sub,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Soft delete a time slot by id' })
  @ApiOkResponse({
    description: 'Time slot deleted successfully',
    schema: {
      example: {
        timeSlotId: 1,
        active: false,
        updatedBy: '12',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Time slot not found' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Delete(':timeSlotId')
  async remove(
    @Param('timeSlotId', ParseIntPipe) timeSlotId: number,
    @Req() req: Request,
  ) {
    const payload = req['user'] as JwtPayload;
    return this.timeSlotService.remove(timeSlotId, payload.sub);
  }
}

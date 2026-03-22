import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import type { JwtPayload } from '../../auth/auth.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SessionType } from '../../ga/domain/session-type';
import { GeneratedScheduleService } from './generated-schedule.service';
import { UpdateGeneratedScheduleItemDto } from './dto/update-generated-schedule-item.dto';

@ApiTags('generated-schedules')
@Controller('generated-schedules')
export class GeneratedScheduleController {
  constructor(
    private readonly generatedScheduleService: GeneratedScheduleService,
  ) {}

  @ApiOperation({ summary: 'Get generated schedule by id' })
  @ApiOkResponse({ description: 'Generated schedule fetched successfully' })
  @ApiNotFoundResponse({ description: 'Generated schedule not found' })
  @ApiQuery({ name: 'semester', required: false, type: Number })
  @ApiQuery({ name: 'careerCode', required: false, type: Number })
  @ApiQuery({ name: 'sessionType', required: false, enum: SessionType })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Get(':generatedScheduleId')
  async findOne(
    @Param('generatedScheduleId', ParseIntPipe) generatedScheduleId: number,
    @Query('semester', new ParseIntPipe({ optional: true })) semester?: number,
    @Query('careerCode', new ParseIntPipe({ optional: true }))
    careerCode?: number,
    @Query('sessionType', new ParseEnumPipe(SessionType, { optional: true }))
    sessionType?: SessionType,
  ) {
    return this.generatedScheduleService.findOne(BigInt(generatedScheduleId), {
      semester,
      careerCode,
      sessionType,
    });
  }

  @ApiOperation({ summary: 'Get generated schedule list' })
  @ApiOkResponse({ description: 'Generated schedule fetched successfully' })
  @ApiNotFoundResponse({ description: 'Generated schedule not found' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Get()
  async findAll() {
    return this.generatedScheduleService.find();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update generated schedule item' })
  @ApiOkResponse({
    description: 'Generated schedule item updated with recalculated warnings',
  })
  @ApiNotFoundResponse({ description: 'Generated schedule not found' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Patch(':generatedScheduleId/items/:generatedScheduleItemId')
  async updateItem(
    @Param('generatedScheduleId', ParseIntPipe) generatedScheduleId: number,
    @Param('generatedScheduleItemId', ParseIntPipe)
    generatedScheduleItemId: number,
    @Body() dto: UpdateGeneratedScheduleItemDto,
    @Req() req: Request,
  ) {
    const payload = req['user'] as JwtPayload;

    return this.generatedScheduleService.updateItem(
      BigInt(generatedScheduleId),
      BigInt(generatedScheduleItemId),
      {
        dayIndex: dto.dayIndex,
        startSlot: dto.startSlot,
        periodCount: dto.periodCount,
        configClassroomId:
          dto.configClassroomId === null
            ? null
            : dto.configClassroomId
              ? BigInt(dto.configClassroomId)
              : undefined,
        configProfessorId:
          dto.configProfessorId === null
            ? null
            : dto.configProfessorId
              ? BigInt(dto.configProfessorId)
              : undefined,
      },
      String(payload.sub),
    );
  }
}

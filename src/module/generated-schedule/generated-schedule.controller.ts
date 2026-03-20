import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
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
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import type { JwtPayload } from '../../auth/auth.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GeneratedScheduleService } from './generated-schedule.service';
import { UpdateGeneratedScheduleItemDto } from './dto/update-generated-schedule-item.dto';

@ApiTags('generated-schedules')
@Controller('generated-schedules')
export class GeneratedScheduleController {
  constructor(
    private readonly generatedScheduleService: GeneratedScheduleService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get generated schedule by id' })
  @ApiOkResponse({ description: 'Generated schedule fetched successfully' })
  @ApiNotFoundResponse({ description: 'Generated schedule not found' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Get(':generatedScheduleId')
  async findOne(
    @Param('generatedScheduleId', ParseIntPipe) generatedScheduleId: number,
    @Query('includeView', new ParseBoolPipe({ optional: true }))
    includeView?: boolean,
  ) {
    return this.generatedScheduleService.findOne(
      BigInt(generatedScheduleId),
      includeView ?? false,
    );
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

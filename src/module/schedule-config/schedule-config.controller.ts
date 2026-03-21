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
import { CreateScheduleConfigDto } from './dto/create-schedule-config.dto';
import { UpdateScheduleConfigDto } from './dto/update-schedule-config.dto';
import { ScheduleConfigService } from './schedule-config.service';

@ApiTags('schedule-configs')
@Controller('schedule-configs')
export class ScheduleConfigController {
  constructor(private readonly scheduleConfigService: ScheduleConfigService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a schedule config' })
  @ApiCreatedResponse({
    description: 'Schedule config created successfully',
    schema: {
      example: {
        scheduleConfigId: '1',
        periodDurationM: 50,
        selectionMethod: 1,
        crossMethod: 1,
        mutationMethod: 1,
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
    @Body() createScheduleConfigDto: CreateScheduleConfigDto,
    @Req() req: Request,
  ) {
    const payload = req['user'] as JwtPayload;
    return this.scheduleConfigService.create(
      createScheduleConfigDto,
      payload.sub,
    );
  }

  @ApiOperation({ summary: 'Get all schedule configs' })
  @ApiOkResponse({
    description: 'Schedule configs fetched successfully',
    schema: {
      example: [
        {
          scheduleConfigId: 1,
          periodDurationM: 50,
          active: true,
        },
      ],
    },
  })
  @Get()
  async findAll() {
    return this.scheduleConfigService.findAll();
  }

  @ApiOperation({ summary: 'Get one schedule config by id' })
  @ApiOkResponse({
    description: 'Schedule config fetched successfully',
    schema: {
      example: {
        scheduleConfigId: 1,
        periodDurationM: 50,
        selectionMethod: 1,
        crossMethod: 1,
        mutationMethod: 1,
        active: true,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Schedule config not found' })
  @Get(':scheduleConfigId')
  async findOne(
    @Param('scheduleConfigId', ParseIntPipe) scheduleConfigId: number,
  ) {
    return this.scheduleConfigService.findOne(scheduleConfigId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a schedule config by id' })
  @ApiOkResponse({
    description: 'Schedule config updated successfully',
    schema: {
      example: {
        scheduleConfigId: 1,
        periodDurationM: 45,
        updatedBy: '12',
        active: true,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Schedule config not found' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Patch(':scheduleConfigId')
  async update(
    @Param('scheduleConfigId', ParseIntPipe) scheduleConfigId: number,
    @Body() updateScheduleConfigDto: UpdateScheduleConfigDto,
    @Req() req: Request,
  ) {
    const payload = req['user'] as JwtPayload;
    return this.scheduleConfigService.update(
      scheduleConfigId,
      updateScheduleConfigDto,
      payload.sub,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Soft delete a schedule config by id' })
  @ApiOkResponse({
    description: 'Schedule config deleted successfully',
    schema: {
      example: {
        scheduleConfigId: 1,
        active: false,
        updatedBy: '12',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Schedule config not found' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Delete(':scheduleConfigId')
  async remove(
    @Param('scheduleConfigId', ParseIntPipe) scheduleConfigId: number,
    @Req() req: Request,
  ) {
    const payload = req['user'] as JwtPayload;
    return this.scheduleConfigService.remove(scheduleConfigId, payload.sub);
  }
}

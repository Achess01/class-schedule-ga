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
import { ConfigClassroomService } from './config-classroom.service';
import { CreateConfigClassroomDto } from './dto/create-config-classroom.dto';
import { UpdateConfigClassroomDto } from './dto/update-config-classroom.dto';

@ApiTags('config-classrooms')
@Controller('config-classrooms')
export class ConfigClassroomController {
  constructor(private readonly service: ConfigClassroomService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a config classroom' })
  @ApiCreatedResponse({
    description: 'Config classroom created successfully',
    schema: {
      example: {
        configClassroomId: '1',
        classroomId: 101,
        scheduleConfigId: 1,
        typeOfSchedule: 'MORNING',
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
    @Body() createDto: CreateConfigClassroomDto,
    @Req() req: Request,
  ) {
    const payload = req['user'] as JwtPayload;
    return this.service.create(createDto, payload.sub);
  }

  @ApiOperation({ summary: 'Get all config classrooms' })
  @ApiOkResponse({
    description: 'Config classrooms fetched successfully',
    schema: {
      example: [
        {
          configClassroomId: 1,
          classroomId: 101,
          scheduleConfigId: 1,
          active: true,
        },
      ],
    },
  })
  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @ApiOperation({ summary: 'Get one config classroom by id' })
  @ApiOkResponse({
    description: 'Config classroom fetched successfully',
    schema: {
      example: {
        configClassroomId: 1,
        classroomId: 101,
        scheduleConfigId: 1,
        active: true,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Config classroom not found' })
  @Get(':configClassroomId')
  async findOne(
    @Param('configClassroomId', ParseIntPipe) configClassroomId: number,
  ) {
    return this.service.findOne(configClassroomId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a config classroom by id' })
  @ApiOkResponse({
    description: 'Config classroom updated successfully',
    schema: {
      example: {
        configClassroomId: 1,
        typeOfSchedule: 'AFTERNOON',
        updatedBy: '12',
        active: true,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Config classroom not found' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Patch(':configClassroomId')
  async update(
    @Param('configClassroomId', ParseIntPipe) configClassroomId: number,
    @Body() updateDto: UpdateConfigClassroomDto,
    @Req() req: Request,
  ) {
    const payload = req['user'] as JwtPayload;
    return this.service.update(configClassroomId, updateDto, payload.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Soft delete a config classroom by id' })
  @ApiOkResponse({
    description: 'Config classroom deleted successfully',
    schema: {
      example: {
        configClassroomId: 1,
        active: false,
        updatedBy: '12',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Config classroom not found' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Delete(':configClassroomId')
  async remove(
    @Param('configClassroomId', ParseIntPipe) configClassroomId: number,
    @Req() req: Request,
  ) {
    const payload = req['user'] as JwtPayload;
    return this.service.remove(configClassroomId, payload.sub);
  }
}

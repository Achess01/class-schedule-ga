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
import { ConfigCourseService } from './config-course.service';
import { CreateConfigCourseDto } from './dto/create-config-course.dto';
import { UpdateConfigCourseDto } from './dto/update-config-course.dto';

@ApiTags('config-courses')
@Controller('config-courses')
export class ConfigCourseController {
  constructor(private readonly service: ConfigCourseService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a config course' })
  @ApiCreatedResponse({
    description: 'Config course created successfully',
    schema: {
      example: {
        configCourseId: '1',
        scheduleConfigId: 1,
        courseCode: 1201,
        sectionQty: 2,
        requireClassroom: true,
        createdBy: '12',
        active: true,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Post()
  async create(@Body() createDto: CreateConfigCourseDto, @Req() req: Request) {
    const payload = req['user'] as JwtPayload;
    return this.service.create(createDto, payload.sub);
  }

  @ApiOperation({ summary: 'Get all config courses' })
  @ApiOkResponse({
    description: 'Config courses fetched successfully',
    schema: {
      example: [
        {
          configCourseId: 1,
          courseCode: 1201,
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

  @ApiOperation({ summary: 'Get one config course by id' })
  @ApiOkResponse({
    description: 'Config course fetched successfully',
    schema: {
      example: {
        configCourseId: 1,
        courseCode: 1201,
        scheduleConfigId: 1,
        active: true,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Config course not found' })
  @Get(':configCourseId')
  async findOne(@Param('configCourseId', ParseIntPipe) configCourseId: number) {
    return this.service.findOne(configCourseId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a config course by id' })
  @ApiOkResponse({
    description: 'Config course updated successfully',
    schema: {
      example: {
        configCourseId: 1,
        sectionQty: 3,
        updatedBy: '12',
        active: true,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Config course not found' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Patch(':configCourseId')
  async update(
    @Param('configCourseId', ParseIntPipe) configCourseId: number,
    @Body() updateDto: UpdateConfigCourseDto,
    @Req() req: Request,
  ) {
    const payload = req['user'] as JwtPayload;
    return this.service.update(configCourseId, updateDto, payload.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Soft delete a config course by id' })
  @ApiOkResponse({
    description: 'Config course deleted successfully',
    schema: {
      example: {
        configCourseId: 1,
        active: false,
        updatedBy: '12',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Config course not found' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Delete(':configCourseId')
  async remove(@Param('configCourseId', ParseIntPipe) configCourseId: number) {
    return this.service.remove(configCourseId);
  }
}

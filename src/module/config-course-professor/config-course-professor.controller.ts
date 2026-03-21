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
import { ConfigCourseProfessorService } from './config-course-professor.service';
import { CreateConfigCourseProfessorDto } from './dto/create-config-course-professor.dto';
import { UpdateConfigCourseProfessorDto } from './dto/update-config-course-professor.dto';

@ApiTags('config-course-professors')
@Controller('config-course-professors')
export class ConfigCourseProfessorController {
  constructor(private readonly service: ConfigCourseProfessorService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a config course professor' })
  @ApiCreatedResponse({
    description: 'Config course professor created successfully',
    schema: {
      example: {
        configCourseProfessorId: '1',
        configProfessorId: 1,
        configCourseId: 1,
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
    @Body() createDto: CreateConfigCourseProfessorDto,
    @Req() req: Request,
  ) {
    const payload = req['user'] as JwtPayload;
    return this.service.create(createDto, payload.sub);
  }

  @ApiOperation({ summary: 'Get all config course professors' })
  @ApiOkResponse({
    description: 'Config course professors fetched successfully',
    schema: {
      example: [
        {
          configCourseProfessorId: 1,
          configProfessorId: 1,
          configCourseId: 1,
          active: true,
        },
      ],
    },
  })
  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @ApiOperation({ summary: 'Get one config course professor by id' })
  @ApiOkResponse({
    description: 'Config course professor fetched successfully',
    schema: {
      example: {
        configCourseProfessorId: 1,
        configProfessorId: 1,
        configCourseId: 1,
        active: true,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Config course professor not found' })
  @Get(':configCourseProfessorId')
  async findOne(
    @Param('configCourseProfessorId', ParseIntPipe)
    configCourseProfessorId: number,
  ) {
    return this.service.findOne(configCourseProfessorId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a config course professor by id' })
  @ApiOkResponse({
    description: 'Config course professor updated successfully',
    schema: {
      example: {
        configCourseProfessorId: 1,
        configProfessorId: 2,
        updatedBy: '12',
        active: true,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Config course professor not found' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Patch(':configCourseProfessorId')
  async update(
    @Param('configCourseProfessorId', ParseIntPipe)
    configCourseProfessorId: number,
    @Body() updateDto: UpdateConfigCourseProfessorDto,
    @Req() req: Request,
  ) {
    const payload = req['user'] as JwtPayload;
    return this.service.update(configCourseProfessorId, updateDto, payload.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Soft delete a config course professor by id' })
  @ApiOkResponse({
    description: 'Config course professor deleted successfully',
    schema: {
      example: {
        configCourseProfessorId: 1,
        active: false,
        updatedBy: '12',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Config course professor not found' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Delete(':configCourseProfessorId')
  async remove(
    @Param('configCourseProfessorId', ParseIntPipe)
    configCourseProfessorId: number,
    @Req() req: Request,
  ) {
    const payload = req['user'] as JwtPayload;
    return this.service.remove(configCourseProfessorId, payload.sub);
  }
}
